import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

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

export async function POST() {
  try {
    const employerId = await verifyEmployer();
    if (!employerId) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo. Lo lut leh rawh." },
        { status: 401 }
      );
    }

    // Perform atomic transaction: Soft-delete Employer + soft-delete their JobPosts
    await prisma.$transaction([
      prisma.employer.update({
        where: { id: employerId },
        data: { isDeleted: true },
      }),
      prisma.jobPost.updateMany({
        where: { employerId },
        data: { status: "deleted" },
      }),
    ]);

    const response = NextResponse.json({ success: true });
    
    // Clear cookie
    response.cookies.delete("employer_session");

    return response;
  } catch (err) {
    console.error("Delete employer account error:", err);
    return NextResponse.json(
      { success: false, error: "Account delete a hlawhchham rih e. Server buaina a awm." },
      { status: 500 }
    );
  }
}
