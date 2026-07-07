import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { deleteR2ObjectByUrl, uploadImage } from "@/lib/r2";
import { syncJobToAlgolia } from "@/lib/algolia";

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
    const employerId = await verifyEmployer();
    if (!employerId) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo. Lo lut leh rawh." },
        { status: 401 }
      );
    }

    const currentEmployer = await prisma.employer.findUnique({
      where: { id: employerId },
      select: { logoUrl: true },
    });
    if (!currentEmployer) {
      return NextResponse.json(
        { success: false, error: "Employer hi hmuh a ni lo." },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const username = formData.get("username")?.toString().trim();
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const phone = formData.get("phone")?.toString().trim();
    const address = formData.get("address")?.toString().trim();
    const logoFile = formData.get("logo") as File | null;

    if (!username || !email || !phone || !address) {
      return NextResponse.json(
        { success: false, error: "Khawngaihin field zawng zawng te hi ziang rawh." },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Email address format a dik lo." },
        { status: 400 }
      );
    }

    // Phone format validation (Indian standard format)
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ""))) {
      return NextResponse.json(
        { success: false, error: "Phone number format a dik lo." },
        { status: 400 }
      );
    }

    // Check uniqueness excluding current employer
    const existing = await prisma.employer.findFirst({
      where: {
        id: { not: employerId },
        isDeleted: false,
        OR: [
          { username },
          { email },
          { phone }
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Username, Email, emaw Phone number hi mi dangin an hmang tawh a ni." },
        { status: 400 }
      );
    }

    // Process logo upload if provided
    let logoUrl = undefined;
    if (logoFile && logoFile.size > 0) {
      try {
        const arrayBuffer = await logoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        logoUrl = await uploadImage(buffer, logoFile.type || "application/octet-stream");
      } catch (uploadError) {
        console.error("Logo upload failed during profile update:", uploadError);
        return NextResponse.json(
          { success: false, error: "Logo thlalak upload a hlawhchham rih. Khawngaihin thlalak dang hmang rawh." },
          { status: 500 }
        );
      }
    }

    // Update employer record
    await prisma.employer.update({
      where: { id: employerId },
      data: {
        username,
        email,
        phone,
        address,
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    if (
      logoUrl &&
      currentEmployer.logoUrl &&
      currentEmployer.logoUrl !== logoUrl
    ) {
      await deleteR2ObjectByUrl(currentEmployer.logoUrl);
    }

    // Sync employer's active (live) job listings to Algolia
    const liveJobs = await prisma.jobPost.findMany({
      where: { employerId, status: "live" },
      select: { id: true }
    });

    for (const job of liveJobs) {
      try {
        await syncJobToAlgolia(job.id);
      } catch (syncErr) {
        console.error(`Failed to sync job ${job.id} on profile update:`, syncErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update profile API error:", err);
    return NextResponse.json(
      { success: false, error: "Profile tihthar a hlawhchham rih. Server buaina a awm." },
      { status: 500 }
    );
  }
}
