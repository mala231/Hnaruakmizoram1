import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim() || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const [jobTitles, categories, locations] = await Promise.all([
      // Distinct live job titles matching the query
      prisma.jobPost.findMany({
        where: {
          status: "live",
          title: { contains: query, mode: "insensitive" },
        },
        select: { title: true },
        distinct: ["title"],
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // Category names matching the query
      prisma.category.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
        select: { id: true, name: true },
        take: 3,
      }),
      // Location names matching the query
      prisma.location.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
        select: { id: true, name: true },
        take: 3,
      }),
    ]);

    const suggestions = [
      ...jobTitles.map((j) => ({ type: "job" as const, label: j.title })),
      ...categories.map((c) => ({ type: "category" as const, label: c.name, id: c.id })),
      ...locations.map((l) => ({ type: "location" as const, label: l.name, id: l.id })),
    ];

    return NextResponse.json({ suggestions }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
