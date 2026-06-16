import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Khawngaihin email address dik tak ziak rawh (e.g. name@example.com)" },
        { status: 400 }
      );
    }

    // Send the contact email to support
    await sendEmail({
      to: "massti249@gmail.com",
      subject: `Mamawh Contact Form: Message from ${name}`,
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
          <p style="font-size: 12px; color: #777; text-align: center;">© ${new Date().getFullYear()} Mamawh Job Board. Mizoram.</p>
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
