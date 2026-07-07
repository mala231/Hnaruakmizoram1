import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signResetPasswordJWT } from "@/lib/auth";
import { sendForgotPasswordOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email input a ngai e." },
        { status: 400 }
      );
    }

    const cleanedEmail = email.trim().toLowerCase();

    // Look up employer
    const employer = await prisma.employer.findFirst({
      where: {
        email: cleanedEmail,
        isDeleted: false,
      },
    });

    if (!employer) {
      return NextResponse.json(
        { success: false, error: "Email hi inziahluhna a ni lo e." },
        { status: 404 }
      );
    }

    // Generate random OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const otpCreatedAt = Date.now();

    // Send the password reset OTP email
    try {
      await sendForgotPasswordOtpEmail(cleanedEmail, otpCode);
    } catch (sendErr) {
      console.error("Failed to send forgot password email:", sendErr);
    }

    // Sign the short-lived pending JWT reset token
    const resetToken = await signResetPasswordJWT({
      email: cleanedEmail,
      otpHash,
      otpCreatedAt,
    });

    return NextResponse.json({
      success: true,
      token: resetToken,
    });
  } catch (err) {
    console.error("Forgot password API error:", err);
    return NextResponse.json(
      { success: false, error: "OTP thawn a hlawhchham rih. Server buaina a awm." },
      { status: 500 }
    );
  }
}
