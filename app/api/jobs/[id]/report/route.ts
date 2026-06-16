import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reason, details } = await request.json();

    // 1. Verify job post exists and is not deleted
    const jobPost = await prisma.jobPost.findUnique({
      where: { id },
    });

    if (!jobPost) {
      return NextResponse.json(
        { success: false, error: "Hna puanzar hi hmuh a ni lo." },
        { status: 404 }
      );
    }

    // 2. Validate input fields
    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: "Report chhan a dik lo." },
        { status: 400 }
      );
    }

    // 3. Create the report
    await prisma.report.create({
      data: {
        jobPostId: id,
        reason: reason.trim(),
        details: details ? details.trim() : null,
        status: "pending",
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
