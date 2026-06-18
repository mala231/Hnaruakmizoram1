import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyResetPasswordJWT, signJWT } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { token, otp, newPassword } = await request.json();

    if (!token || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: "OTP, Token, leh Password thar te hi an ngai e." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password hi character 6 aia tlem lo a ni tur a ni." },
        { status: 400 }
      );
    }

    // Verify reset token
    const payload = await verifyResetPasswordJWT(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "OTP validity a tawp tawh, khawngaihin a thar thawn leh rawh." },
        { status: 400 }
      );
    }

    // Check expiration (10 minutes)
    const now = Date.now();
    if (now - payload.otpCreatedAt > 10 * 60 * 1000) {
      return NextResponse.json(
        { success: false, error: "OTP a expire tawh e. A thar dil leh rawh." },
        { status: 400 }
      );
    }

    // Compare OTP
    const isOtpMatch = await bcrypt.compare(otp, payload.otpHash);
    if (!isOtpMatch) {
      return NextResponse.json(
        { success: false, error: "OTP code ziak hi a dik lo." },
        { status: 400 }
      );
    }

    // Update Employer Password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const employer = await prisma.employer.update({
      where: { email: payload.email },
      data: { passwordHash },
    });

    // Create session cookie to log employer in directly
    const sessionToken = await signJWT({
      userId: employer.id,
      role: "employer",
    });

    const response = NextResponse.json({ success: true });

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
    console.error("Reset password API error:", err);
    return NextResponse.json(
      { success: false, error: "Password thlakna a hlawhchham rih. Server buaina a awm." },
      { status: 500 }
    );
  }
}
