import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;

  const payload = await verifyJWT(token);
  return payload?.role === "admin";
}

// GET all live job posts (admin only)
export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    const items = await prisma.jobPost.findMany({
      where: {
        status: "live",
        employer: { isDeleted: false },
      },
      include: {
        employer: true,
        category: true,
        location: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    console.error("GET admin jobs error:", err);
    return NextResponse.json(
      { success: false, error: "Hna zawn hmuh a harsat rih e." },
      { status: 500 }
    );
  }
}
