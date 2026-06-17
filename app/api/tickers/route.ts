import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 120;

export async function GET() {
  try {
    const items = await prisma.tickerItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    const response = NextResponse.json({ success: true, data: items });
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=120, stale-while-revalidate=300"
    );
    return response;
  } catch (err) {
    console.error("GET tickers error:", err);
    return NextResponse.json(
      { success: false, error: "Announcements lak chhuah a harsat rih e." },
      { status: 500 }
    );
  }
}


