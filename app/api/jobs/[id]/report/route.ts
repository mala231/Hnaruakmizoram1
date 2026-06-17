import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reason, details } = await request.json();

    const cookieStore = await cookies();
    const lang = cookieStore.get("lang")?.value || "mz";
    const isMizo = lang === "mz";

    // 1. Verify job post exists and is not deleted
    const jobPost = await prisma.jobPost.findUnique({
      where: { id },
    });

    if (!jobPost) {
      return NextResponse.json(
        { success: false, error: isMizo ? "Hna puanzar hi hmuh a ni lo." : "Job listing not found." },
        { status: 404 }
      );
    }

    // 2. Validate input fields
    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: isMizo ? "Report chhan a dik lo." : "Invalid report reason." },
        { status: 400 }
      );
    }

    // 3. Limit reports to once per employer per IP address
    const ip = getClientIp(request);
    const existingReport = await prisma.report.findFirst({
      where: {
        ipAddress: ip,
        jobPost: {
          employerId: jobPost.employerId,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        {
          success: false,
          error: isMizo
            ? "He employer-a hna dah hi i report tawh a ni."
            : "You have already reported a listing from this employer."
        },
        { status: 400 }
      );
    }

    // 4. Create the report
    await prisma.report.create({
      data: {
        jobPostId: id,
        reason: reason.trim(),
        details: details ? details.trim() : null,
        status: "pending",
        ipAddress: ip,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("POST job report error:", err);
    return NextResponse.json(
      { success: false, error: "Report thawn a hlawhchham rih e." },
      { status: 500 }
    );
  }
}
