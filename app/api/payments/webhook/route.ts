import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { syncJobToAlgolia } from "@/lib/algolia";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET is not configured. Webhook request rejected.");
      return NextResponse.json(
        { success: false, error: "Webhook is not configured on server." },
        { status: 500 }
      );
    }

    // 1. Verify cryptographic signature from Razorpay
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Invalid signature detected on Razorpay Webhook request.");
      return NextResponse.json(
        { success: false, error: "Signature verification failed." },
        { status: 400 }
      );
    }

    // 2. Parse event payload
    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // We only care about successful payment events
    if (event === "order.paid" || event === "payment.captured") {
      const orderId = payload.payload.payment?.entity?.order_id || payload.payload.order?.entity?.id;
      const paymentId = payload.payload.payment?.entity?.id;

      if (!orderId) {
        return NextResponse.json(
          { success: false, error: "Order ID not found in payload." },
          { status: 400 }
        );
      }

      // 3. Find and update database records
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
        include: { jobPost: true },
      });

      if (!payment) {
        console.warn(`Payment record not found for Razorpay Order ID: ${orderId}`);
        return NextResponse.json(
          { success: false, error: "Payment record not found." },
          { status: 404 }
        );
      }

      if (payment.status === "confirmed") {
        return NextResponse.json({ success: true, message: "Payment already confirmed." });
      }

      // Calculate expiration timestamp
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + payment.durationDays);

      // Perform atomic database transaction
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "confirmed",
            razorpayPaymentId: paymentId || null,
            razorpaySignature: signature,
          },
        }),
        prisma.jobPost.update({
          where: { id: payment.jobPostId },
          data: {
            status: "live",
            expiresAt,
          },
        }),
      ]);

      // Sync job post to Algolia search index
      await syncJobToAlgolia(payment.jobPostId);

      console.log(`Payment confirmed and Job Post set to Live: ${payment.jobPostId}`);

      // Dispatch activation email to employer
      try {
        const updatedPost = await prisma.jobPost.findUnique({
          where: { id: payment.jobPostId },
          include: { employer: true },
        });
        if (updatedPost && updatedPost.employer.email) {
          const { sendActivationEmail } = await import("@/lib/email");
          await sendActivationEmail(
            updatedPost.employer.email,
            updatedPost.title,
            payment.durationDays
          );
        }
      } catch (mailErr) {
        console.error("Webhook mail notification failed:", mailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
