import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

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

export async function POST(request: Request) {
  try {
    // 1. Verify Employer Authentication
    const employerId = await verifyEmployer();
    if (!employerId) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo. Khawngaihin lo lut leh rawh." },
        { status: 401 }
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
      durationDays,
      pdfUrl,
    } = body;

    // 2. Validate input fields
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
        { success: false, error: "Khawngaihin hna diltu ziahna tur zawng zawng hi dik takin ziang chhuak rawh." },
        { status: 400 }
      );
    }

    // 3. Validate duration (1–30 days)
    const parsedDuration = parseInt(durationDays, 10);
    if (isNaN(parsedDuration) || parsedDuration < 1 || parsedDuration > 30) {
      return NextResponse.json(
        { success: false, error: "Listing duration hi 1 aiin tam leh 30 aiin tlem a ni tur a ni." },
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

    // 4. Save Job Post as "pending" — awaiting admin approval
    const jobPost = await prisma.jobPost.create({
      data: {
        employerId,
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        categoryId: parsedCategoryId,
        locationId: parsedLocationId,
        address: address.trim(),
        deadline: new Date(deadline),
        interviewTime: interviewTime.trim(),
        status: "pending", // Awaiting admin approval — no payment required
        durationDays: parsedDuration,
        pdfUrl: pdfUrl || null,
      },
    });

    return NextResponse.json({
      success: true,
      jobId: jobPost.id,
    });

  } catch (err) {
    console.error("Create job post error:", err);
    return NextResponse.json(
      { success: false, error: "Hna thar dah a hlawhchham rih e. Server buaina a awm." },
      { status: 500 }
    );
  }
}
