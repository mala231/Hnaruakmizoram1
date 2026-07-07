import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const employerId = await verifyEmployer();
    if (!employerId) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo. Khawngaihin lo lut leh rawh." },
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
        { success: false, error: "Hna hi i ta a nih loh avangin i thawh thui thei lo." },
        { status: 403 }
      );
    }

    const { durationDays } = await request.json();
    const duration = parseInt(durationDays, 10);
    if (isNaN(duration) || duration < 1 || duration > 30) {
      return NextResponse.json(
        { success: false, error: "Puanzar chhung thlan tur hi a dik lo (Ni 1 atanga 30 inkar a ni tur a ni)." },
        { status: 400 }
      );
    }

    // Calculate new expiration date
    let baseDate = new Date();
    if (job.status === "live" && job.expiresAt && new Date(job.expiresAt) > new Date()) {
      baseDate = new Date(job.expiresAt);
    }
    const newExpiresAt = new Date(baseDate);
    newExpiresAt.setDate(newExpiresAt.getDate() + duration);

    // Update job post in database
    await prisma.jobPost.update({
      where: { id },
      data: {
        status: "live",
        expiresAt: newExpiresAt,
      },
    });

    // Sync job post to Algolia search index
    await syncJobToAlgolia(id);

    return NextResponse.json({
      success: true,
      message: "Hna puanzar pawtsei a ni ta.",
      expiresAt: newExpiresAt,
    });

  } catch (err) {
    console.error("Job extension error:", err);
    return NextResponse.json(
      { success: false, error: "Pawtsei tura hmalakna hi a hlawhchham rih. Server buaina a awm." },
      { status: 500 }
    );
  }
}
