import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendEmail, validateEmailLegitimacy } from "@/lib/email";
import { isRateLimited } from "@/lib/rateLimit";
import { signPendingContactJWT, verifyPendingContactJWT } from "@/lib/auth";

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, lang, token, otp } = body;
    const isMizo = lang === "mz";

    // Rate Limiter Check (3 messages max per IP per hour)
    const ip = getClientIp(request);
    if (isRateLimited(ip, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        {
          error: isMizo
            ? "Mesej i thawn hnem tawh lutuk rih. Khawngaihin darkar khat hnuah lo thawn leh rawh."
            : "Too many messages sent. Please try again in an hour."
        },
        { status: 429 }
      );
    }

    // Phase 2: Verify OTP and Submit Message to Admin
    if (token && otp) {
      const pending = await verifyPendingContactJWT(token);
      if (!pending) {
        return NextResponse.json(
          {
            error: isMizo
              ? "Verification session a tawp tawh hmel. Khawngaihin thawn nawn leh rawh."
              : "Verification session expired. Please request a new code."
          },
          { status: 400 }
        );
      }

      // Check OTP expiration (10 minutes)
      if (Date.now() - pending.otpCreatedAt > 10 * 60 * 1000) {
        return NextResponse.json(
          {
            error: isMizo
              ? "Verification code hi a expired tawh a ni. Khawngaihin thawn nawn leh rawh."
              : "Verification code has expired. Please try again."
          },
          { status: 400 }
        );
      }

      // Verify OTP code matching
      const isOtpValid = await bcrypt.compare(otp, pending.otpHash);
      if (!isOtpValid) {
        return NextResponse.json(
          {
            error: isMizo
              ? "Verification code hi a dik lo. A dang chhu rawh le."
              : "Invalid verification code. Please check and try again."
          },
          { status: 400 }
        );
      }

      // Send the contact email to support/admin
      await sendEmail({
        to: "massti249@gmail.com",
        subject: `Hnaruak Mizoram Contact Form: Message from ${pending.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1c7dfa; margin-bottom: 20px; border-bottom: 2px solid #1c7dfa; padding-bottom: 10px;">New Contact Message</h2>
            <p><strong>Name:</strong> ${pending.name}</p>
            <p><strong>Email:</strong> ${pending.email}</p>
            <p style="margin-top: 20px; margin-bottom: 5px;"><strong>Message:</strong></p>
            <div style="background-color: #f9fafb; border-left: 4px solid #1c7dfa; padding: 15px; font-style: italic; white-space: pre-wrap; border-radius: 4px;">
              ${pending.message}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #777; text-align: center;">© ${new Date().getFullYear()} Hnaruak Mizoram.</p>
          </div>
        `,
      });

      return NextResponse.json({ success: true });
    }

    // Phase 1: Request Verification (Send OTP Code)
    if (!name || !email || !message) {
      return NextResponse.json(
        {
          error: isMizo
            ? "Hming, email leh thuchah ziah vek tur a ni."
            : "Name, email, and message are required."
        },
        { status: 400 }
      );
    }

    // Validate email format and domain legitimacy
    const verification = await validateEmailLegitimacy(email);
    if (!verification.isValid) {
      let errorMsg = "";
      if (verification.reason === "format") {
        errorMsg = isMizo
          ? "Khawngaihin email address dik tak ziak rawh (e.g. name@example.com)"
          : "Please enter a valid email address (e.g. name@example.com)";
      } else if (verification.reason === "disposable") {
        errorMsg = isMizo
          ? "Disposable/temporary email hman phal a ni lo."
          : "Disposable or temporary email addresses are not allowed.";
      } else if (verification.reason === "typo") {
        errorMsg = isMizo
          ? "I email domain a sual palh a ni thei (e.g. gamil.com tih tur gmail.com). Khawngaihin a dikin ziak rawh."
          : "Your email domain contains a typo. Please check and correct it.";
      } else if (verification.reason === "no_mx") {
        errorMsg = isMizo
          ? "Email domain a dik lo (he email domain hian mail thawn luhna active record a nei lo). Khawngaihin email dik tak hmang rawh."
          : "The email domain is invalid (no MX records found). Please use a real active email address.";
      } else {
        errorMsg = isMizo
          ? "Email validity check a hlawhchham."
          : "Email validation failed.";
      }

      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Generate 6-digit verification code & hash it
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const otpCreatedAt = Date.now();

    // Send the verification OTP code directly to the user's email
    await sendEmail({
      to: email,
      subject: isMizo ? "Hnaruak Mizoram: Contact Verification Code" : "Hnaruak Mizoram: Email Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h2 style="color: #1c7dfa; margin-bottom: 20px; border-bottom: 2px solid #1c7dfa; padding-bottom: 10px;">Contact Verification Code</h2>
          <p>Hello,</p>
          <p>${
            isMizo
              ? "Hnaruak Mizoram Contact Form message thawn tur hian verification code a hnuaia mi hi hmang rawh le:"
              : "Please use the following OTP code to verify and complete your Contact Form submission on Hnaruak Mizoram:"
          }</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: 800; color: #1c7dfa; letter-spacing: 5px; padding: 10px 20px; background-color: #f0f7ff; border-radius: 8px; border: 1px solid #1c7dfa;">
              ${otpCode}
            </span>
          </div>
          <p>${
            isMizo
              ? "Verification OTP code hi <strong>minute 10</strong> chhung chauh a nung ang."
              : "This verification code will expire in <strong>10 minutes</strong>."
          }</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #777; text-align: center;">© ${new Date().getFullYear()} Hnaruak Mizoram.</p>
        </div>
      `,
    });

    // Sign pending contact token
    const pendingToken = await signPendingContactJWT({
      name,
      email,
      message,
      otpHash,
      otpCreatedAt,
    });

    return NextResponse.json({
      success: true,
      pendingVerification: true,
      token: pendingToken
    });

  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again later." },
      { status: 500 }
    );
  }
}
