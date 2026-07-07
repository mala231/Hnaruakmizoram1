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

// PUT to edit or toggle ticker status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const tickerId = parseInt(id, 10);
    if (isNaN(tickerId)) {
      return NextResponse.json(
        { success: false, error: "ID a dik lo." },
        { status: 400 }
      );
    }

    const { text, isActive } = await request.json();

    const data: any = {};
    if (text !== undefined) {
      if (typeof text !== "string" || !text.trim()) {
        return NextResponse.json(
          { success: false, error: "Text a dik lo." },
          { status: 400 }
        );
      }
      data.text = text.trim();
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    const updated = await prisma.tickerItem.update({
      where: { id: tickerId },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT admin ticker error:", err);
    return NextResponse.json(
      { success: false, error: "Ticker thlak a hlawhchham." },
      { status: 500 }
    );
  }
}

// DELETE a ticker item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const tickerId = parseInt(id, 10);
    if (isNaN(tickerId)) {
      return NextResponse.json(
        { success: false, error: "ID a dik lo." },
        { status: 400 }
      );
    }

    await prisma.tickerItem.delete({
      where: { id: tickerId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE admin ticker error:", err);
    return NextResponse.json(
      { success: false, error: "Ticker delete a hlawhchham." },
      { status: 500 }
    );
  }
}
