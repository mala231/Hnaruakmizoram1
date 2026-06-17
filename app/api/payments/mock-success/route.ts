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

export async function POST(request: Request) {
  try {
    // 1. Verify Employer Session
    const employerId = await verifyEmployer();
    if (!employerId) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID a dik lo." },
        { status: 400 }
      );
    }

    // 2. Fetch Job Post & Check Ownership
    const jobPost = await prisma.jobPost.findUnique({
      where: { id: jobId },
    });

    if (!jobPost) {
      return NextResponse.json(
        { success: false, error: "Hna puanzar hi hmuh a ni lo." },
        { status: 404 }
      );
    }

    if (jobPost.employerId !== employerId) {
      return NextResponse.json(
        { success: false, error: "Hna puanzar dang i thlak thei lo." },
        { status: 403 }
      );
    }

    if (jobPost.status === "live") {
      return NextResponse.json({ success: true, message: "Hna hi a live tawh sa a ni." });
    }

    // 3. Prevent bypass in production if Razorpay keys are configured
    const keyId = process.env.RAZORPAY_KEY_ID;
    const isProd = process.env.NODE_ENV === "production";
    if (keyId && isProd) {
      return NextResponse.json(
        { success: false, error: "Mock bypass is disabled in production." },
        { status: 400 }
      );
    }

    // 4. Calculate expiration timestamp
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + jobPost.durationDays);

    const amount = jobPost.durationDays === 15 ? 299 : 499;
    const mockId = Math.random().toString(36).substring(2, 11).toUpperCase();

    // 5. Atomic database transaction to create payment and update status
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          employerId,
          jobPostId: jobPost.id,
          razorpayOrderId: `mock_order_${mockId}`,
          razorpayPaymentId: `mock_pay_${mockId}`,
          amount,
          durationDays: jobPost.durationDays,
          status: "confirmed",
        },
      }),
      prisma.jobPost.update({
        where: { id: jobPost.id },
        data: {
          status: "live",
          expiresAt,
        },
      }),
    ]);

    // Sync job post to Algolia search index
    await syncJobToAlgolia(jobPost.id);

    // Dispatch mock activation email to employer
    try {
      const updatedPost = await prisma.jobPost.findUnique({
        where: { id: jobPost.id },
        include: { employer: true },
      });
      if (updatedPost && updatedPost.employer.email) {
        const { sendActivationEmail } = await import("@/lib/email");
        await sendActivationEmail(
          updatedPost.employer.email,
          updatedPost.title,
          jobPost.durationDays
        );
      }
    } catch (mailErr) {
      console.error("Mock success mail notification failed:", mailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mock success error:", err);
    return NextResponse.json(
      { success: false, error: "Fulfillment simulated error." },
      { status: 500 }
    );
  }
}
