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

// PUT to toggle isFeatured status of a job post
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
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID a dik lo." },
        { status: 400 }
      );
    }

    const { isFeatured } = await request.json();
    if (isFeatured === undefined) {
      return NextResponse.json(
        { success: false, error: "isFeatured status a dik lo." },
        { status: 400 }
      );
    }

    const updated = await prisma.jobPost.update({
      where: { id },
      data: {
        isFeatured: Boolean(isFeatured),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT admin job featured error:", err);
    return NextResponse.json(
      { success: false, error: "Hna thlak a hlawhchham." },
      { status: 500 }
    );
  }
}
