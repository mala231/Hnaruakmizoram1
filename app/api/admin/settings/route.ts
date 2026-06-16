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

// GET setting by key
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key) {
      return NextResponse.json(
        { success: false, error: "Setting key a ngai." },
        { status: 400 }
      );
    }

    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    return NextResponse.json({ success: true, data: setting });
  } catch (err) {
    console.error("GET admin settings error:", err);
    return NextResponse.json(
      { success: false, error: "Settings zawn hmuh a harsat rih e." },
      { status: 500 }
    );
  }
}

// POST/PUT save setting
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    const { key, value } = await request.json();
    if (!key || typeof key !== "string" || !key.trim()) {
      return NextResponse.json(
        { success: false, error: "Setting key a dik lo." },
        { status: 400 }
      );
    }

    if (value === undefined || typeof value !== "string") {
      return NextResponse.json(
        { success: false, error: "Setting value a dik lo." },
        { status: 400 }
      );
    }

    const setting = await prisma.setting.upsert({
      where: { key: key.trim() },
      update: { value },
      create: { key: key.trim(), value },
    });

    return NextResponse.json({ success: true, data: setting });
  } catch (err) {
    console.error("POST admin settings error:", err);
    return NextResponse.json(
      { success: false, error: "Settings dah a hlawhchham." },
      { status: 500 }
    );
  }
}
