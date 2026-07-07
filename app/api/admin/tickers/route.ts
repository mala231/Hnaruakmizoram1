import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;

  const payload = await verifyJWT(token);
  return payload?.role === "admin";
}

// GET all ticker items (admin only)
export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    const items = await prisma.tickerItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    console.error("GET admin tickers error:", err);
    return NextResponse.json(
      { success: false, error: "Tickers zawn hmuh a harsat rih e." },
      { status: 500 }
    );
  }
}

// POST create ticker item (admin only)
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    const { text } = await request.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "Ticker text a dik lo." },
        { status: 400 }
      );
    }

    const item = await prisma.tickerItem.create({
      data: {
        text: text.trim(),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) {
    console.error("POST admin tickers error:", err);
    return NextResponse.json(
      { success: false, error: "Ticker siam a hlawhchham." },
      { status: 500 }
    );
  }
}
