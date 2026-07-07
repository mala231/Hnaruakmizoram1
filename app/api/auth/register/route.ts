import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/r2";
import { signPendingRegisterJWT } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";
import { sendOtpSms } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const username = formData.get("username")?.toString().trim();
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const phone = formData.get("phone")?.toString().trim();
    const address = formData.get("address")?.toString().trim();
    const password = formData.get("password")?.toString();
    const logoFile = formData.get("logo") as File | null;

    // 1. Boundary Input Validation
    if (!username || !email || !phone || !address || !password) {
      return NextResponse.json(
        { success: false, error: "Khawngaihin a chunga field zawng zawng te hi ziang rawh." },
        { status: 400 }
      );
    }

    // 1.1 Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Khawngaihin email address dik tak ziak rawh (e.g. name@example.com)." },
        { status: 400 }
      );
    }

    // 1.2 Phone format validation (Indian standard format)
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ""))) {
      return NextResponse.json(
        { success: false, error: "Khawngaihin phone number dik tak ziak rawh (digit 10 awm tur a ni, e.g. 9876543210)." },
        { status: 400 }
      );
    }

    // 2. Uniqueness Checks
    const existing = await prisma.employer.findFirst({
      where: {
        OR: [
          { username },
          { email },
          { phone }
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Username, Email, emaw Phone number hi hman tawh a ni." },
        { status: 400 }
      );
    }

    // 3. Process Logo Upload
    let logoUrl = "/icon-512.png"; // Default fallback
    if (logoFile && logoFile.size > 0) {
      try {
        const arrayBuffer = await logoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        logoUrl = await uploadImage(buffer, logoFile.type || "application/octet-stream");
      } catch (uploadError) {
        console.error("Logo upload failed:", uploadError);
        return NextResponse.json(
          { success: false, error: "Logo upload a hlawhchham. Khawngaihin thlalak dang hmang rawh." },
          { status: 500 }
        );
      }
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Generate OTP & Hashed OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const otpCreatedAt = Date.now();

    // 6. Send OTP to email and phone (simulated)
    try {
      await sendOtpEmail(email, otpCode);
      await sendOtpSms(phone, otpCode);
    } catch (sendErr) {
      console.error("Failed to dispatch registration OTP:", sendErr);
    }

    // 7. Sign JWT payload for pending registration
    const pendingToken = await signPendingRegisterJWT({
      username,
      email,
      phone,
      address,
      passwordHash,
      logoUrl,
      otpHash,
      otpCreatedAt,
    });

    return NextResponse.json({
      success: true,
      pendingVerification: true,
      token: pendingToken,
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { success: false, error: "Inziahluhna a hlawhchham. Server buaina a awm." },
      { status: 500 }
    );
  }
}
