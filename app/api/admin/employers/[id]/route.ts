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

// DELETE — soft-suspend by default; pass ?permanent=true for full hard deletion
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
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    // Check if employer exists
    const employer = await prisma.employer.findUnique({ where: { id } });
    if (!employer) {
      return NextResponse.json(
        { success: false, error: "Employer hi hmuh a ni lo." },
        { status: 404 }
      );
    }

    if (permanent) {
      // Hard delete — remove all associated data then the employer row
      // Order matters: delete child records before parent to satisfy FK constraints
      await prisma.$transaction(async (tx) => {
        // 1. Delete all reports on this employer's job posts
        const jobIds = (
          await tx.jobPost.findMany({
            where: { employerId: id },
            select: { id: true },
          })
        ).map((j) => j.id);

        if (jobIds.length > 0) {
          await tx.report.deleteMany({ where: { jobPostId: { in: jobIds } } });
          await tx.payment.deleteMany({ where: { jobPostId: { in: jobIds } } });
          await tx.jobPost.deleteMany({ where: { employerId: id } });
        }

        // 2. Delete any payments directly on employer
        await tx.payment.deleteMany({ where: { employerId: id } });

        // 3. Finally delete the employer record
        await tx.employer.delete({ where: { id } });
      });

      return NextResponse.json({ success: true, permanent: true });
    }

    // Soft delete — mark isDeleted and hide listings
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

    return NextResponse.json({ success: true, permanent: false });
  } catch (err) {
    console.error("DELETE admin employer error:", err);
    return NextResponse.json(
      { success: false, error: "Employer delete a hlawhchham rih." },
      { status: 500 }
    );
  }
}

