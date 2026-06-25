import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { syncJobToAlgolia, deleteJobFromAlgolia } from "@/lib/algolia";

async function verifyEmployer() {
  const cookieStore = await cookies();
  const token = cookieStore.get("employer_session")?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (payload?.role === "employer") {
    return payload.userId;
  }
  return null;
}

// PUT to edit a job post
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const employerId = await verifyEmployer();
    if (!employerId) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo. Lo lut leh rawh." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if job exists
    const job = await prisma.jobPost.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Hna puanzar hi hmuh a ni lo." },
        { status: 404 }
      );
    }

    // Verify ownership
    if (job.employerId !== employerId) {
      return NextResponse.json(
        { success: false, error: "Hna hi i ta a nih loh avangin i tidanglam thei lo." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      shortDescription,
      description,
      categoryId,
      locationId,
      address,
      deadline,
      interviewTime,
      pdfUrl,
    } = body;

    // Validate input fields
    if (
      !title || typeof title !== "string" || !title.trim() ||
      !shortDescription || typeof shortDescription !== "string" || !shortDescription.trim() ||
      !description || typeof description !== "string" || !description.trim() ||
      !categoryId ||
      !locationId ||
      !address || typeof address !== "string" || !address.trim() ||
      !deadline ||
      !interviewTime || typeof interviewTime !== "string" || !interviewTime.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Khawngaihin a chunga field ho saw dik takin ziang rawh le." },
        { status: 400 }
      );
    }

    const parsedCategoryId = parseInt(categoryId, 10);
    const parsedLocationId = parseInt(locationId, 10);

    if (isNaN(parsedCategoryId) || isNaN(parsedLocationId)) {
      return NextResponse.json(
        { success: false, error: "Category emaw District hi a dik lo." },
        { status: 400 }
      );
    }

    const updatedJob = await prisma.jobPost.update({
      where: { id },
      data: {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        categoryId: parsedCategoryId,
        locationId: parsedLocationId,
        address: address.trim(),
        deadline: new Date(deadline),
        interviewTime: interviewTime.trim(),
        pdfUrl: pdfUrl || null,
      },
    });

    // Sync edited job post to Algolia search index
    await syncJobToAlgolia(id);

    return NextResponse.json({ success: true, data: updatedJob });
  } catch (err) {
    console.error("PUT job error:", err);
    return NextResponse.json(
      { success: false, error: "Tihdanglamna a hlawhchham rih e." },
      { status: 500 }
    );
  }
}

// DELETE to soft-delete a job post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const employerId = await verifyEmployer();
    if (!employerId) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo. Lo lut leh rawh." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if job exists
    const job = await prisma.jobPost.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Hna puanzar hi hmuh a ni lo." },
        { status: 404 }
      );
    }

    // Verify ownership
    if (job.employerId !== employerId) {
      return NextResponse.json(
        { success: false, error: "Hna hi i ta a nih loh avangin i delete thei lo." },
        { status: 403 }
      );
    }

    // Soft-delete: set status to "deleted"
    await prisma.jobPost.update({
      where: { id },
      data: { status: "deleted" },
    });

    // Remove deleted job post from Algolia search index
    await deleteJobFromAlgolia(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE job error:", err);
    return NextResponse.json(
      { success: false, error: "Hna delete hi a hlawhchham rih." },
      { status: 500 }
    );
  }
}
