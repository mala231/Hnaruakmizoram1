import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";

const IMAGE_PREFIX = "mizoram_job_board";
const PDF_PREFIX = "mizoram_job_board_pdfs";
const DEFAULT_LOGO_URL = "/icon-512.png";
const DEFAULT_PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

function hasR2Config() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL
  );
}

function getR2PublicHost() {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) {
    return null;
  }

  try {
    return new URL(publicUrl).hostname;
  } catch {
    return null;
  }
}

function makePublicUrl(key: string) {
  const baseUrl = process.env.R2_PUBLIC_URL;
  if (!baseUrl) {
    throw new Error("R2_PUBLIC_URL is not configured.");
  }
  return `${baseUrl.replace(/\/$/, "")}/${key}`;
}

function extractObjectKeyFromPublicUrl(url: string) {
  const allowedHost = getR2PublicHost();
  if (!allowedHost) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== allowedHost) {
      return null;
    }

    const key = parsedUrl.pathname.replace(/^\/+/, "");
    return key || null;
  } catch {
    return null;
  }
}

/**
 * Uploads image bytes to R2 and returns the public URL.
 * Falls back to a local placeholder image when R2 is not configured.
 */
export async function uploadImage(
  buffer: Buffer,
  mimeType = "application/octet-stream"
): Promise<string> {
  if (!hasR2Config()) {
    console.warn("R2 environment variables are not fully configured. Falling back to placeholder image URL.");
    return DEFAULT_LOGO_URL;
  }

  const extension = mimeType.split("/")[1]?.toLowerCase() || "bin";
  const key = `${IMAGE_PREFIX}/${crypto.randomUUID()}.${extension}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return makePublicUrl(key);
}

/**
 * Uploads a PDF file buffer to R2 and returns the public URL.
 * Falls back to a dummy PDF URL when R2 is not configured.
 */
export async function uploadPdf(buffer: Buffer, filename?: string): Promise<string> {
  if (!hasR2Config()) {
    console.warn("R2 environment variables are not fully configured. Falling back to dummy PDF URL.");
    return DEFAULT_PDF_URL;
  }

  const baseName = filename
    ? filename.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 50)
    : "circular";
  const key = `${PDF_PREFIX}/${baseName}_${crypto.randomUUID()}.pdf`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
      ContentDisposition: `inline; filename="${baseName}.pdf"`,
    })
  );

  return makePublicUrl(key);
}

/**
 * Deletes a single R2 object referenced by public URL.
 * Returns false when URL is not an R2 object for this app.
 */
export async function deleteR2ObjectByUrl(url: string | null | undefined): Promise<boolean> {
  if (!url || !hasR2Config()) {
    return false;
  }

  const key = extractObjectKeyFromPublicUrl(url);
  if (!key) {
    return false;
  }

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error(`Failed to delete R2 object for key "${key}":`, error);
    return false;
  }
}

/**
 * Deletes multiple R2 objects referenced by public URLs.
 * Skips invalid or non-matching hosts.
 */
export async function deleteR2ObjectsByUrls(urls: Array<string | null | undefined>): Promise<void> {
  for (const url of urls) {
    await deleteR2ObjectByUrl(url);
  }
}
