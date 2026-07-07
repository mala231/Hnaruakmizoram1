import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { deleteJobFromAlgolia } from "@/lib/algolia";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;

  const payload = await verifyJWT(token);
  return payload?.role === "admin";
}

// PUT to update report status (e.g. dismiss or review)
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
    const reportId = parseInt(id, 10);
    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, error: "ID a dik lo." },
        { status: 400 }
      );
    }

    const { status } = await request.json();
    if (!status || typeof status !== "string") {
      return NextResponse.json(
        { success: false, error: "Status a dik lo." },
        { status: 400 }
      );
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: { status: status.trim() },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT admin report error:", err);
    return NextResponse.json(
      { success: false, error: "Report thlak a hlawhchham." },
      { status: 500 }
    );
  }
}

// DELETE to resolve report by soft-deleting offending Job Post
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
    const reportId = parseInt(id, 10);
    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, error: "ID a dik lo." },
        { status: 400 }
      );
    }

    // Find the report to locate the jobPostId
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report hi hmuh a ni lo." },
        { status: 404 }
      );
    }

    // Atomic transaction: soft-delete the job post and update report status to reviewed
    await prisma.$transaction([
      prisma.jobPost.update({
        where: { id: report.jobPostId },
        data: { status: "deleted" },
      }),
      prisma.report.update({
        where: { id: reportId },
        data: { status: "reviewed" },
      }),
    ]);

    // Remove reported job post from Algolia search index
    await deleteJobFromAlgolia(report.jobPostId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE admin report error:", err);
    return NextResponse.json(
      { success: false, error: "Hna delete leh report update a hlawhchham." },
      { status: 500 }
    );
  }
}
