import nodemailer from "nodemailer";
import dns from "dns";
import { prisma } from "./prisma";

// SMTP variables configuration
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || "no-reply@hnaruakmizoram.com";

// Check if credentials exist for a real SMTP client
const hasSmtpConfig = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // True for port 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

/**
 * Generic email dispatcher helper
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: SMTP_FROM,
        to,
        subject,
        html,
      });
      console.log(`[Email Sent] Successfully dispatched email to ${to}`);
    } catch (err) {
      console.error(`[Email Error] Failed to send email to ${to}:`, err);
    }
  } else {
    // Console Logging Fallback for local environments
    console.log("\n==================================================");
    console.log("             [SIMULATED EMAIL LOG]                ");
    console.log("==================================================");
    console.log(`From:    ${SMTP_FROM}`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("------------------ Content -----------------------");
    // Strip HTML tags roughly for console presentation
    console.log(html.replace(/<[^>]*>/g, " ").trim());
    console.log("==================================================\n");
  }
}

/**
 * Send notification to employer that their job post has been published
 */
export async function sendActivationEmail(
  toEmail: string,
  jobTitle: string,
  durationDays: number
) {
  const subject = "Hnaruak Mizoram: I Hna Puanzar a nung ta e";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
      <h2 style="color: #a20000; margin-bottom: 20px;">Hna Puanzar Active A Ni Ta!</h2>
      <p>Dear Employer,</p>
      <p>I hnathawh zawnna post <strong>"${jobTitle}"</strong> chu hlawhtling takin tlangzarh a ni ta e.</p>
      <p>He hna puanzar hi tlawmngaiin <strong>ni ${durationDays}</strong> chhung public feed ah mi zawng zawng hmuh theih turin a lang dawn a ni.</p>
      <p style="margin-top: 30px;">Hna thar dang dah i duh leh chuan i dashboard-ah i lo lut leh dawn nia.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">© ${new Date().getFullYear()} Hnaruak Mizoram.</p>
    </div>
  `;
  await sendEmail({ to: toEmail, subject, html });
}

/**
 * Send notification to employer that their job post is expiring in 3 days
 */
export async function sendPreExpiryWarnings(): Promise<number> {
  try {
    const now = new Date();
    // 3 days from now range (approximate window check of exactly day 3)
    const threeDaysFromNowStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const threeDaysFromNowEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const expiringJobs = await prisma.jobPost.findMany({
      where: {
        status: "live",
        expiresAt: {
          gte: threeDaysFromNowStart,
          lte: threeDaysFromNowEnd,
        },
      },
      include: {
        employer: true,
      },
    });

    console.log(`[Cron Task] Found ${expiringJobs.length} listings expiring in 3 days.`);

    for (const job of expiringJobs) {
      const subject = "Hnaruak Mizoram: I Hna Puanzar a tawp tep e";
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h2 style="color: #a20000; margin-bottom: 20px;">Hna Puanzar Tawp Tur Hriattirna</h2>
          <p>Dear ${job.employer.username},</p>
          <p>I hnathawh puanzar <strong>"${job.title}"</strong> hi <strong>ni 3 hnuah</strong> a tawp (expire) dawn a ni.</p>
          <p>A hun pawtsei (extend) i duh chuan khawngaihin i employer dashboard ah lo lutin i pawtsei leh vat dawn nia.</p>
          <p style="margin-top: 30px;">Dashboard luhna: <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" style="color: #a20000; font-weight: bold; text-decoration: none;">Dashboard-ah Lut Rawh</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #777; text-align: center;">© ${new Date().getFullYear()} Hnaruak Mizoram.</p>
        </div>
      `;
      await sendEmail({ to: job.employer.email, subject, html });
    }

    return expiringJobs.length;
  } catch (err) {
    console.error("[Cron Task Error] Pre-expiry warnings check failed:", err);
    return 0;
  }
}

// Blocklist of common disposable email domains
const DISPOSABLE_DOMAINS = new Set([
  "yopmail.com", "mailinator.com", "tempmail.com", "temp-mail.org", "guerrillamail.com",
  "dispostable.com", "10minutemail.com", "trashmail.com", "getairmail.com", "sharklasers.com",
  "guerrillamailblock.com", "guerrillamail.net", "guerrillamail.org", "guerrillamail.biz",
  "pokemail.net", "grr.la", "teleworm.us", "dayrep.com", "fleckens.hu", "einrot.com",
  "armyspy.com", "cuvox.de", "superrito.com", "gustr.com", "rhyta.com", "mailnesia.com",
  "maildrop.cc", "getnada.com", "boun.cr", "incognitomail.com"
]);

// Blocklist of obvious domain typos that are commonly fake
const TYPO_DOMAINS = new Set([
  "gamil.com", "gmaill.com", "gamil.co", "gmal.com", "gmaik.com", "gamil.net",
  "yaho.com", "yahooo.com", "yahu.com", "hotail.com", "hotmai.com", "hotmial.com"
]);

/**
 * Validates the legitimacy of an email address based on syntax,
 * blocklists (disposable/typo domains), and active DNS MX record verification.
 */
export async function validateEmailLegitimacy(email: string): Promise<{
  isValid: boolean;
  reason: "format" | "disposable" | "typo" | "no_mx" | null;
}> {
  // 1. Basic format syntax verification
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, reason: "format" };
  }

  const [, domain] = email.toLowerCase().split("@");

  // 2. Check for obvious typo domains
  if (TYPO_DOMAINS.has(domain)) {
    return { isValid: false, reason: "typo" };
  }

  // 3. Check for disposable/temp email domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { isValid: false, reason: "disposable" };
  }

  // 4. DNS MX record validation (checks if domain actually exists and accepts mail)
  try {
    const records = await dns.promises.resolveMx(domain);
    if (!records || records.length === 0) {
      return { isValid: false, reason: "no_mx" };
    }
  } catch (err: any) {
    // Gracefully fallback for systems errors (e.g., local ECONNREFUSED/timeout/outage)
    // Only fail if it's a definitive "not found" / "no data" error code.
    if (err.code === "ENOTFOUND" || err.code === "ENODATA") {
      return { isValid: false, reason: "no_mx" };
    }
    console.warn(`[Email Validation] DNS MX check skipped for domain "${domain}" due to system error: ${err.message}`);
  }

  return { isValid: true, reason: null };
}

/**
 * Sends a registration verification OTP email to the employer.
 */
export async function sendOtpEmail(toEmail: string, otpCode: string): Promise<void> {
  const subject = "Hnaruak Mizoram: Inziahluhna OTP Verification";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
      <h2 style="color: #1c7dfa; margin-bottom: 20px; border-bottom: 2px solid #1c7dfa; padding-bottom: 10px;">Verification OTP Code</h2>
      <p>Dear Employer,</p>
      <p>Hnaruak Mizoram-a inziahluh nan a hnuaia verification OTP code hi hmang rawh le:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: 800; color: #1c7dfa; letter-spacing: 5px; padding: 10px 20px; background-color: #f0f7ff; border-radius: 8px; border: 1px solid #1c7dfa;">
          ${otpCode}
        </span>
      </div>
      <p>He OTP code hi <strong>minute 10</strong> chhung chauh a nung ang.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">© ${new Date().getFullYear()} Hnaruak Mizoram.</p>
    </div>
  `;
  await sendEmail({ to: toEmail, subject, html });
}

