import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { syncJobToAlgolia } from "@/lib/algolia";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  const payload = await verifyJWT(token);
  return payload?.role === "admin";
}

// POST /api/admin/jobs/[id]/approve — approve a pending job post
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const job = await prisma.jobPost.findUnique({ where: { id } });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Hna puanzar hi hmuh a ni lo." },
        { status: 404 }
      );
    }

    if (job.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Hna puanzar hi pending state-ah a awm lo." },
        { status: 400 }
      );
    }

    // Calculate expiry based on employer-chosen duration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + job.durationDays);

    await prisma.jobPost.update({
      where: { id },
      data: {
        status: "live",
        expiresAt,
      },
    });

    // Sync to Algolia search index in the background
    syncJobToAlgolia(id).catch((err) =>
      console.error("[Algolia Sync Error] Failed to sync approved job:", err)
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Approve job error:", err);
    return NextResponse.json(
      { success: false, error: "Approve a hlawhchham rih e." },
      { status: 500 }
    );
  }
}
