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

// GET all registered employers (admin only)
export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    const employers = await prisma.employer.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: employers });
  } catch (err) {
    console.error("GET admin employers error:", err);
    return NextResponse.json(
      { success: false, error: "Employers zawn hmuh a harsat rih e." },
      { status: 500 }
    );
  }
}
