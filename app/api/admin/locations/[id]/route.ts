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

// PUT to edit a location (district)
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
    const locationId = parseInt(id, 10);
    if (isNaN(locationId)) {
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

    // Check if name is taken by another location
    const existing = await prisma.location.findFirst({
      where: {
        name: trimmedName,
        NOT: { id: locationId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "He District hming hi hman a ni tawh." },
        { status: 400 }
      );
    }

    const updated = await prisma.location.update({
      where: { id: locationId },
      data: { name: trimmedName },
    });

    revalidateTag("districts", "max");

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT location error:", err);
    return NextResponse.json(
      { success: false, error: "District thlak a hlawhchham." },
      { status: 500 }
    );
  }
}

// DELETE a location (district)
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
    const locationId = parseInt(id, 10);
    if (isNaN(locationId)) {
      return NextResponse.json(
        { success: false, error: "ID a dik lo." },
        { status: 400 }
      );
    }

    // Check if there are any job posts referencing this location
    const associatedPosts = await prisma.jobPost.count({
      where: { locationId },
    });

    if (associatedPosts > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "He district hi hna puanzarah hman a nih vangin a delete theih loh rih.",
        },
        { status: 400 }
      );
    }

    await prisma.location.delete({
      where: { id: locationId },
    });

    revalidateTag("districts", "max");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE location error:", err);
    return NextResponse.json(
      { success: false, error: "District delete a hlawhchham." },
      { status: 500 }
    );
  }
}
