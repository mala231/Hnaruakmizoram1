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
      !interviewTime || typeof interviewTime !== "string" || !interviewTime.trim() ||
      (durationDays !== 15 && durationDays !== 30)
    ) {
      return NextResponse.json(
        { success: false, error: "Khawngaihin hna diltu ziahna tur zawng zawng hi dik takin ziang chhuak rawh." },
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

    // 3. Save draft Job Post to database
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
        status: "draft", // Saved as draft pending checkout payment
        durationDays,
        pdfUrl: pdfUrl || null,
      },
    });

    // 4. Calculate amount
    const amount = durationDays === 15 ? 299 : 499;
    const amountPaise = amount * 100;

    // 5. Check Razorpay settings
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      // Mock bypass fallback when keys are not set
      console.log("Razorpay credentials not set. Falling back to Mock Payment Mode.");
      return NextResponse.json({
        success: true,
        isMock: true,
        jobId: jobPost.id,
        amount,
        title: jobPost.title,
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
      receipt: jobPost.id,
    };

    const order = await razorpay.orders.create(orderOptions);

    // Save pending Payment record in database
    await prisma.payment.create({
      data: {
        employerId,
        jobPostId: jobPost.id,
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
      jobId: jobPost.id,
    });

  } catch (err) {
    console.error("Create job post / billing error:", err);
    return NextResponse.json(
      { success: false, error: "Hna thar dah a hlawhchham rih e. Server buaina a awm." },
      { status: 500 }
    );
  }
}
