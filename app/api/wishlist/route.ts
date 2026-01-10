import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

async function requireUser(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  if (!userEmail) return null;

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });
  return user;
}

export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        select: { id: true, name: true, brand: true, image: true, url: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = items.map((item) => ({
    id: item.id,
    label: item.label || item.product?.name || "Wishlist item",
    productId: item.productId,
    externalProductUrl: item.externalProductUrl,
    product: item.product,
    createdAt: item.createdAt,
  }));

  return NextResponse.json({ items: formatted });
}

export async function POST(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (_err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { productId, externalProductUrl, label, meta } = body || {};
  if (!productId && !externalProductUrl) {
    return NextResponse.json({ error: "Missing productId or externalProductUrl" }, { status: 400 });
  }

  if (productId) {
    const productExists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!productExists) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const existing = await prisma.wishlistItem.findFirst({
    where: {
      userId: user.id,
      OR: [
        productId ? { productId } : undefined,
        externalProductUrl ? { externalProductUrl } : undefined,
      ].filter(Boolean) as any,
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ ok: true, alreadyExists: true });
  }

  const item = await prisma.wishlistItem.create({
    data: {
      userId: user.id,
      productId: productId ?? null,
      externalProductUrl: externalProductUrl ?? null,
      label: label ?? null,
      meta: meta ?? null,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: item.id });
}

export async function DELETE(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing wishlist item id" }, { status: 400 });
  }

  const existing = await prisma.wishlistItem.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await prisma.wishlistItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
