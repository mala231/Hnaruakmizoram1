import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.tickerItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    console.error("GET tickers error:", err);
    return NextResponse.json(
      { success: false, error: "Announcements lak chhuah a harsat rih e." },
      { status: 500 }
    );
  }
}
