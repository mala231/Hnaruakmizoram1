import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyPendingRegisterJWT, signJWT } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { otp, token } = await request.json();

    if (!otp || !token) {
      return NextResponse.json(
        { success: false, error: "OTP code leh token an ngai." },
        { status: 400 }
      );
    }

    const payload = await verifyPendingRegisterJWT(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Inziahluhna session hi a nung tawh lo. Khawngaihin register tha leh rawh." },
        { status: 400 }
      );
    }

    // Check OTP expiration (10 minutes)
    const isExpired = Date.now() - payload.otpCreatedAt > 10 * 60 * 1000;
    if (isExpired) {
      return NextResponse.json(
        { success: false, error: "OTP code hi a hmang tlak tawh lo (expired). Thawn tha leh rawh." },
        { status: 400 }
      );
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp, payload.otpHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "OTP code ziak hi a dik lo. Khawngaihin enfiah leh rawh." },
        { status: 400 }
      );
    }

    // Double check for uniqueness before final insertion
    const existing = await prisma.employer.findFirst({
      where: {
        OR: [
          { username: payload.username },
          { email: payload.email },
          { phone: payload.phone }
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Username, Email, emaw Phone number hi hman tawh a ni." },
        { status: 400 }
      );
    }

    // Create the employer record
    const employer = await prisma.employer.create({
      data: {
        username: payload.username,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        logoUrl: payload.logoUrl,
        passwordHash: payload.passwordHash,
      },
    });

    // Sign actual JWT session
    const sessionToken = await signJWT({
      userId: employer.id,
      role: "employer",
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: employer.id,
        username: employer.username,
        email: employer.email,
      },
    });

    response.cookies.set({
      name: "employer_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json(
      { success: false, error: "Nemnghehna a hlawhchham rih. Server buaina." },
      { status: 500 }
    );
  }
}
