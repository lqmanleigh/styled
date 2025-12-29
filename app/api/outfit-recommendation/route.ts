import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch (_err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { eventId, userEmail } = body || {};
  if (!eventId || !userEmail) {
    return NextResponse.json({ error: "Missing eventId or userEmail" }, { status: 400 });
  }

  // TODO: handle the event (e.g., enqueue job, generate recommendations)

  // Respond to Webhook
  return NextResponse.json({ ok: true, eventId });
}
