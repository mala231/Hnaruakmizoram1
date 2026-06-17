import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { rebuildAlgoliaIndex, isAlgoliaConfigured } from "@/lib/algolia";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;

  const payload = await verifyJWT(token);
  return payload?.role === "admin";
}

export async function POST() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    if (!isAlgoliaConfigured()) {
      return NextResponse.json(
        { success: false, error: "Algolia credentials are not configured in .env." },
        { status: 400 }
      );
    }

    await rebuildAlgoliaIndex();

    return NextResponse.json({
      success: true,
      message: "Algolia search index has been successfully rebuilt.",
    });
  } catch (err: any) {
    console.error("[Algolia Rebuild Route Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to rebuild Algolia index." },
      { status: 500 }
    );
  }
}
