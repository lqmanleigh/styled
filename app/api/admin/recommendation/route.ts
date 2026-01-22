import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ALLOWED_CATEGORIES = new Set(["formal", "casual", "streetwear"]);

function normalizeKeyword(input: string) {
  return (input || "").trim().toLowerCase();
}

function requireAdmin(req: NextRequest) {
  const token = req.headers.get("x-admin-token") || "";
  const expected = process.env.ADMIN_TOKEN || "";
  return expected && token === expected;
}

/**
 * GET: list rules + keywords
 */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rules = await prisma.eventRule.findMany({
    include: { keywords: true },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ rules });
}

/**
 * POST: add keyword under selected category
 * Body: { category, keyword }
 */
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const category = (body.category || "").toLowerCase();
  const keyword = normalizeKeyword(body.keyword || "");

  if (!ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json(
      { error: "Invalid category" },
      { status: 400 }
    );
  }

  if (!keyword || keyword.length < 2) {
    return NextResponse.json(
      { error: "Keyword must be at least 2 characters" },
      { status: 400 }
    );
  }

  // Check duplicate keyword globally
  const existing = await prisma.eventKeyword.findUnique({
    where: { keyword },
    include: { rule: true },
  });

  if (existing) {
    return NextResponse.json(
      {
        ok: false,
        code: "DUPLICATE",
        message: `Keyword "${keyword}" already exists under category "${existing.rule.targetCategory}".`,
      },
      { status: 409 }
    );
  }

  // Ensure rule exists (1 rule per category)
  const rule = await prisma.eventRule.upsert({
    where: { targetCategory: category },
    update: { enabled: true },
    create: {
      name: `${category[0].toUpperCase()}${category.slice(1)} Events`,
      targetCategory: category,
      priority: category === "formal" ? 3 : category === "casual" ? 2 : 1,
      enabled: true,
    },
  });

  try {
    const created = await prisma.eventKeyword.create({
      data: {
        keyword,
        ruleId: rule.id,
        enabled: true,
      },
    });

    return NextResponse.json(
      { ok: true, keyword: created },
      { status: 201 }
    );
  } catch (err: any) {
    // Safety net for race condition
    if (err?.code === "P2002") {
      return NextResponse.json(
        { ok: false, code: "DUPLICATE", message: "Keyword already exists." },
        { status: 409 }
      );
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.id) {
    return NextResponse.json(
      { error: "Missing keyword id" },
      { status: 400 }
    );
  }

  const updated = await prisma.eventKeyword.update({
    where: { id: body.id },
    data: { enabled: false },
  });

  return NextResponse.json({
    ok: true,
    message: "Keyword deleted",
    keyword: updated,
  });
}