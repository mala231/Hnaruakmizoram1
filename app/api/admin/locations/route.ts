import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { verifyJWT } from "@/lib/auth";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;

  const payload = await verifyJWT(token);
  return payload?.role === "admin";
}

// GET all locations (districts)
export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: locations });
  } catch (err) {
    console.error("GET locations error:", err);
    return NextResponse.json(
      { success: false, error: "District te zawn hmuh a harsat rih e." },
      { status: 500 }
    );
  }
}

// POST create a location (Admin only)
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    const { name } = await request.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "District hming a dik lo." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if location name already exists
    const existing = await prisma.location.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "He District hi a awm sa tawh a ni." },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: { name: trimmedName },
    });

    revalidateTag("districts", "max");

    return NextResponse.json({ success: true, data: location }, { status: 201 });
  } catch (err) {
    console.error("POST location error:", err);
    return NextResponse.json(
      { success: false, error: "District siam a hlawhchham." },
      { status: 500 }
    );
  }
}
