import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyPendingRegisterJWT, signPendingRegisterJWT } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";
import { sendOtpSms } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Session token a ngai." },
        { status: 400 }
      );
    }

    const payload = await verifyPendingRegisterJWT(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Inziahluhna session hi a nung tawh lo. Khawngaihin in-register tha leh rawh." },
        { status: 400 }
      );
    }

    // Generate new OTP & Hashed OTP
    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpHash = await bcrypt.hash(newOtpCode, 10);
    const newOtpCreatedAt = Date.now();

    // Send new OTP
    try {
      await sendOtpEmail(payload.email, newOtpCode);
      await sendOtpSms(payload.phone, newOtpCode);
    } catch (sendErr) {
      console.error("Failed to dispatch resent registration OTP:", sendErr);
    }

    // Sign new token with refreshed OTP state
    const newToken = await signPendingRegisterJWT({
      ...payload,
      otpHash: newOtpHash,
      otpCreatedAt: newOtpCreatedAt,
    });

    return NextResponse.json({
      success: true,
      token: newToken,
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return NextResponse.json(
      { success: false, error: "OTP thawn nawnna a hlawhchham rih. Server buaina." },
      { status: 500 }
    );
  }
}
