import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

function run(cmd: string, args: string[], cwd: string) {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
    const child = spawn(cmd, args, { cwd, shell: true });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));

    child.on("close", (code) => resolve({ code: code ?? 0, stdout, stderr }));
  });
}

let isRunning = false;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prevent double-click / concurrent runs
  if (isRunning) {
    return NextResponse.json({ error: "A scrape is already running" }, { status: 409 });
  }

  isRunning = true;

  try {
    const projectRoot = process.cwd();
    const scraperRoot = `${projectRoot}/my_scraper`;

    // Use one shared timestamp/run id for everything
    const scrapeRunId = new Date().toISOString().replace(/[:.]/g, "-");

    // 1) Run spiders
    const py = await run(
      "python",
      ["-m", "my_scraper.spiders.run_all_spiders", "--scrape_run_id", scrapeRunId],
      scraperRoot
    );

    if (py.code !== 0) {
      return NextResponse.json(
        { step: "scrape", code: py.code, stdout: py.stdout, stderr: py.stderr },
        { status: 500 }
      );
    }

    // 2) Import into DB
    const imp = await run(
      "node",
      ["scripts/import-products.js", "--scrape_run_id", scrapeRunId],
      projectRoot
    );

    if (imp.code !== 0) {
      return NextResponse.json(
        { step: "import", code: imp.code, stdout: imp.stdout, stderr: imp.stderr },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      scrapeRunId,
      scrape: { stdout: py.stdout, stderr: py.stderr },
      import: { stdout: imp.stdout, stderr: imp.stderr },
    });
  } finally {
    isRunning = false;
  }
}
