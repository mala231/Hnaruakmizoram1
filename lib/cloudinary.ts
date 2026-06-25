import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary.
 * Falls back to a high-quality placeholder image if Cloudinary credentials are not configured.
 */
export async function uploadImage(buffer: Buffer): Promise<string> {
  const isConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!isConfigured) {
    console.warn(
      "Cloudinary environment variables are not set. Falling back to placeholder image URL."
    );
    // Return the same placeholder used elsewhere in the app — avoids storing large base64 blobs in DB
    return "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mizoram_job_board",
        allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (result && result.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Cloudinary upload failed to return secure URL"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Uploads a PDF file buffer to Cloudinary as a raw resource.
 * Falls back to a dummy PDF URL if Cloudinary is not configured.
 */
export async function uploadPdf(buffer: Buffer, filename?: string): Promise<string> {
  const isConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!isConfigured) {
    console.warn(
      "Cloudinary environment variables are not set. Falling back to dummy PDF URL."
    );
    return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  }

  // Generate a clean public ID containing the file name and ending with .pdf
  const baseName = filename
    ? filename.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 50)
    : "circular";
  const uniqueId = crypto.randomUUID();
  const publicId = `${baseName}_${uniqueId}.pdf`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mizoram_job_board_pdfs",
        resource_type: "raw",
        type: "upload",         // publicly accessible (not "private" or "authenticated")
        access_mode: "public",  // explicitly mark as public
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (result && result.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Cloudinary upload failed to return secure URL"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

