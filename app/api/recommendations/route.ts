import { PrismaClient } from "@prisma/client";
import { classifyEvent } from "@/lib/ruleEngine";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // 1️⃣ Load enabled rules + enabled keywords
    const rules = await prisma.eventRule.findMany({
      where: { enabled: true },
      include: { keywords: { where: { enabled: true } } },
    });

    // 2️⃣ Load products (fashion flag already computed elsewhere)
    const products = await prisma.product.findMany();

    // 3️⃣ Fetch user calendar events
    const calendarRes = await fetch(
      `${process.env.NEXTAUTH_URL}/api/calendar/events`,
      { headers: { cookie: req.headers.get("cookie") || "" } }
    );

    const { events = [] } = await calendarRes.json();

    // 4️⃣ Rule-based recommendation
    const recommendations = events.map((ev) => {
      // Rule-based classification using keywords
      const category = classifyEvent(ev.summary, rules);

      // ✅ Simple rule-based filter
      const pool =
        category
          ? products.filter(
              (p) =>
                p.isFashion === true && // 🔒 RULE 1: must be fashion
                p.category?.toLowerCase() === category // 🔒 RULE 2: must match category
            )
          : [];

      return {
        eventId: ev.id,
        title: ev.summary,
        category,
        pool, // full pool (UI controls display count)
      };
    });

    return Response.json(recommendations);
  } catch (err) {
    return Response.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
