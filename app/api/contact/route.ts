import { NextResponse } from "next/server";
import { sendEmail, validateEmailLegitimacy } from "@/lib/email";
import { isRateLimited } from "@/lib/rateLimit";

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
    const { name, email, message, lang } = await request.json();
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

    // Send the contact email to support
    await sendEmail({
      to: "massti249@gmail.com",
      subject: `Hnaruak Mizoram Contact Form: Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h2 style="color: #1c7dfa; margin-bottom: 20px; border-bottom: 2px solid #1c7dfa; padding-bottom: 10px;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p style="margin-top: 20px; margin-bottom: 5px;"><strong>Message:</strong></p>
          <div style="background-color: #f9fafb; border-left: 4px solid #1c7dfa; padding: 15px; font-style: italic; white-space: pre-wrap; border-radius: 4px;">
            ${message}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #777; text-align: center;">© ${new Date().getFullYear()} Hnaruak Mizoram.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
