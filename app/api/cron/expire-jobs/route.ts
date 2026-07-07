import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPreExpiryWarnings } from "@/lib/email";
import { deleteMultipleJobsFromAlgolia } from "@/lib/algolia";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Security check: if CRON_SECRET is configured, check for matching Bearer token
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    const now = new Date();

    // Fetch IDs of live jobs matching expiry condition to remove from Algolia
    const jobsToExpire = await prisma.jobPost.findMany({
      where: {
        status: "live",
        expiresAt: {
          lte: now,
        },
      },
      select: { id: true }
    });
    const expiredIds = jobsToExpire.map((job) => job.id);

    // 1. Mark expired job posts
    const expiredCount = await prisma.jobPost.updateMany({
      where: {
        id: { in: expiredIds },
      },
      data: {
        status: "expired",
      },
    });

    // Remove from Algolia
    if (expiredIds.length > 0) {
      await deleteMultipleJobsFromAlgolia(expiredIds);
    }

    // 2. Dispatch warning emails for posts expiring in 3 days
    const warningsSentCount = await sendPreExpiryWarnings();

    return NextResponse.json({
      success: true,
      message: "Cron checks completed successfully.",
      data: {
        expiredCount: expiredCount.count,
        warningsSent: warningsSentCount,
      },
    });
  } catch (err: any) {
    console.error("[Manual Cron Endpoint Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Cron checks failed." },
      { status: 500 }
    );
  }
}
export async function GET(request: Request) {
  // Graceful response for simple browser checks
  return NextResponse.json({
    success: false,
    error: "Post request only supported. Submit POST request to trigger cron.",
  }, { status: 405 });
}
