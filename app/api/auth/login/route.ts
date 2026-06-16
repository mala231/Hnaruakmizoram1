import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { identity, password } = await request.json();

    // 1. Validate inputs
    if (!identity || !password) {
      return NextResponse.json(
        { success: false, error: "Hming/Email leh Password ziang rawh." },
        { status: 400 }
      );
    }

    // 2. Lookup Employer (excluding soft-deleted ones)
    const employer = await prisma.employer.findFirst({
      where: {
        OR: [
          { username: identity },
          { email: identity.toLowerCase() },
        ],
        isDeleted: false,
      },
    });

    if (!employer) {
      return NextResponse.json(
        { success: false, error: "Hming/Email emaw Password a dik lo." },
        { status: 401 }
      );
    }

    // 3. Verify Password
    const passwordMatch = await bcrypt.compare(password, employer.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: "Hming/Email emaw Password a dik lo." },
        { status: 401 }
      );
    }

    // 4. Sign Session JWT
    const token = await signJWT({
      userId: employer.id,
      role: "employer",
    });

    // 5. Build response and set HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      data: {
        id: employer.id,
        username: employer.username,
        email: employer.email,
      },
    });

    response.cookies.set({
      name: "employer_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: "Luhna a hlawhchham. Server buaina a awm." },
      { status: 500 }
    );
  }
}
