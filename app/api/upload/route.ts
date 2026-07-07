import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { uploadPdf } from "@/lib/r2";

async function verifyEmployer() {
  const cookieStore = await cookies();
  const token = cookieStore.get("employer_session")?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (payload?.role === "employer") {
    return payload.userId;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    // 1. Verify Employer Auth
    const employerId = await verifyEmployer();
    if (!employerId) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo. Khawngaihin lo lut leh rawh." },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "File i thlang lo emaw, a ruak a ni." },
        { status: 400 }
      );
    }

    // 3. Limit to PDF format and size <= 5MB
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "PDF file chauh upload phal a ni." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size hi 5MB aia tlem a ni tur a ni." },
        { status: 400 }
      );
    }

    // 4. Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfUrl = await uploadPdf(buffer, file.name);

    return NextResponse.json({
      success: true,
      url: pdfUrl,
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    return NextResponse.json(
      { success: false, error: "File upload a hlawhchham rih. Server buaina a awm." },
      { status: 500 }
    );
  }
}
