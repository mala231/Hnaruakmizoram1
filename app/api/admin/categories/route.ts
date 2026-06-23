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

// GET all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (err) {
    console.error("GET categories error:", err);
    return NextResponse.json(
      { success: false, error: "Category te zawn hmuh a harsat rih e." },
      { status: 500 }
    );
  }
}

// POST create a category (Admin only)
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
        { success: false, error: "Category hming a dik lo." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if category name already exists
    const existing = await prisma.category.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "He Category hi a awm sa tawh a ni." },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name: trimmedName },
    });

    revalidateTag("categories", "max");

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (err) {
    console.error("POST category error:", err);
    return NextResponse.json(
      { success: false, error: "Category siam a hlawhchham." },
      { status: 500 }
    );
  }
}
