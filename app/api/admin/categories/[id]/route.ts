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

// PUT to edit a category
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
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: "ID a dik lo." },
        { status: 400 }
      );
    }

    const { name } = await request.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Hming a dik lo." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if name is taken by another category
    const existing = await prisma.category.findFirst({
      where: {
        name: trimmedName,
        NOT: { id: categoryId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "He Category hming hi hman a ni tawh." },
        { status: 400 }
      );
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { name: trimmedName },
    });

    revalidateTag("categories", "max");

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT category error:", err);
    return NextResponse.json(
      { success: false, error: "Category thlak a hlawhchham." },
      { status: 500 }
    );
  }
}

// DELETE a category
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
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: "ID a dik lo." },
        { status: 400 }
      );
    }

    // Check if there are any job posts referencing this category
    const associatedPosts = await prisma.jobPost.count({
      where: { categoryId },
    });

    if (associatedPosts > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "He category hi hna puanzarah hman a nih vangin a delete theih loh rih.",
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidateTag("categories", "max");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE category error:", err);
    return NextResponse.json(
      { success: false, error: "Category delete a hlawhchham." },
      { status: 500 }
    );
  }
}
