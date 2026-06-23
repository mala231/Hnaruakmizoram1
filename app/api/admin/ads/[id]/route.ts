import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { verifyJWT } from "@/lib/auth";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;

  const payload = await verifyJWT(token);
  return payload?.role === "admin";
}

// PUT to edit or toggle ad status
export async function PUT(
  request: Request,
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
    const adId = parseInt(id, 10);
    if (isNaN(adId)) {
      return NextResponse.json(
        { success: false, error: "ID a dik lo." },
        { status: 400 }
      );
    }

    const { targetUrl, position, isActive } = await request.json();

    const data: any = {};
    if (targetUrl !== undefined) {
      if (typeof targetUrl !== "string" || !targetUrl.trim()) {
        return NextResponse.json(
          { success: false, error: "Target URL a dik lo." },
          { status: 400 }
        );
      }
      data.targetUrl = targetUrl.trim();
    }

    if (position !== undefined) {
      if (typeof position !== "string" || !position.trim()) {
        return NextResponse.json(
          { success: false, error: "Position a dik lo." },
          { status: 400 }
        );
      }
      data.position = position.trim();
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    const updated = await prisma.advertisement.update({
      where: { id: adId },
      data,
    });

    revalidateTag("advertisements", "max");

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT admin ad error:", err);
    return NextResponse.json(
      { success: false, error: "Ad banner thlak a hlawhchham." },
      { status: 500 }
    );
  }
}

// DELETE an advertisement
export async function DELETE(
  request: Request,
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
    const adId = parseInt(id, 10);
    if (isNaN(adId)) {
      return NextResponse.json(
        { success: false, error: "ID a dik lo." },
        { status: 400 }
      );
    }

    await prisma.advertisement.delete({
      where: { id: adId },
    });

    revalidateTag("advertisements", "max");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE admin ad error:", err);
    return NextResponse.json(
      { success: false, error: "Ad banner delete a hlawhchham." },
      { status: 500 }
    );
  }
}
