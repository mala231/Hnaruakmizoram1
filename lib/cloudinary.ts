import { v2 as cloudinary } from "cloudinary";

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
      "Cloudinary environment variables are not set. Falling back to base64 Data URL."
    );
    const base64 = buffer.toString("base64");
    return `data:image/png;base64,${base64}`;
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
