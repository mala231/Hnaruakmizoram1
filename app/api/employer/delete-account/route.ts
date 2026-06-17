import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { deleteMultipleJobsFromAlgolia } from "@/lib/algolia";

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

    // Get all job IDs of this employer to remove them from Algolia index
    const employerJobs = await prisma.jobPost.findMany({
      where: { employerId },
      select: { id: true }
    });
    const jobIds = employerJobs.map(j => j.id);

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

    // Remove posts from Algolia
    if (jobIds.length > 0) {
      await deleteMultipleJobsFromAlgolia(jobIds);
    }

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
