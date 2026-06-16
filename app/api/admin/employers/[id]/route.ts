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

// PUT to toggle employer verification status
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
    const { isVerified } = await request.json();

    if (isVerified === undefined) {
      return NextResponse.json(
        { success: false, error: "isVerified thlang rawh." },
        { status: 400 }
      );
    }

    const updated = await prisma.employer.update({
      where: { id },
      data: { isVerified: Boolean(isVerified) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT admin employer error:", err);
    return NextResponse.json(
      { success: false, error: "Employer verify thlak a hlawhchham." },
      { status: 500 }
    );
  }
}

// DELETE to suspend / soft-delete an employer profile & hide listings
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

    // Check if employer exists
    const employer = await prisma.employer.findUnique({
      where: { id },
    });

    if (!employer) {
      return NextResponse.json(
        { success: false, error: "Employer hi hmuh a ni lo." },
        { status: 404 }
      );
    }

    // Perform soft delete transaction
    await prisma.$transaction([
      prisma.employer.update({
        where: { id },
        data: { isDeleted: true },
      }),
      prisma.jobPost.updateMany({
        where: { employerId: id },
        data: { status: "deleted" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE admin employer error:", err);
    return NextResponse.json(
      { success: false, error: "Employer suspend a hlawhchham rih." },
      { status: 500 }
    );
  }
}
