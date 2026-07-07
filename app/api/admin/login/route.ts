import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. Validate inputs
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Hming leh Password ziang rawh." },
        { status: 400 }
      );
    }

    // 2. Lookup Admin
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Hming emaw Password a dik lo." },
        { status: 401 }
      );
    }

    // 3. Verify Password
    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: "Hming emaw Password a dik lo." },
        { status: 401 }
      );
    }

    // 4. Sign Session JWT
    const token = await signJWT({
      userId: String(admin.id),
      role: "admin",
    });

    // 5. Build response and set HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
      },
    });

    response.cookies.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { success: false, error: "Luhna a hlawhchham. Server buaina a awm." },
      { status: 500 }
    );
  }
}
