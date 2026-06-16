import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Razorpay from "razorpay";
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
    if (durationDays !== 15 && durationDays !== 30) {
      return NextResponse.json(
        { success: false, error: "Puanzar chhung thlan tur hi a dik lo." },
        { status: 400 }
      );
    }

    // Amount mapping
    const amount = durationDays === 15 ? 299 : 499;
    const amountPaise = amount * 100;

    // Check Razorpay config
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      // Mock bypass fallback
      console.log("Razorpay credentials not set for Extension. Mock Mode active.");
      return NextResponse.json({
        success: true,
        isMock: true,
        jobId: job.id,
        amount,
        title: `${job.title} Extension`,
      });
    }

    // Initialize Razorpay Client
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create Razorpay Order
    const orderOptions = {
      amount: amountPaise,
      currency: "INR",
      receipt: job.id,
    };

    const order = await razorpay.orders.create(orderOptions);

    // Save pending Payment record in database
    await prisma.payment.create({
      data: {
        employerId,
        jobPostId: job.id,
        razorpayOrderId: order.id,
        amount,
        durationDays,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      isMock: false,
      orderId: order.id,
      amount: amountPaise,
      keyId,
      jobId: job.id,
    });

  } catch (err) {
    console.error("Job extension billing error:", err);
    return NextResponse.json(
      { success: false, error: "Extension process hi a hlawhchham rih. Server buaina a awm." },
      { status: 500 }
    );
  }
}
