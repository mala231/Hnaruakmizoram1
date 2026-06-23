import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { verifyJWT } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;

  const payload = await verifyJWT(token);
  return payload?.role === "admin";
}

// GET advertisements (public fetches active, admin fetches all)
export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    
    const ads = await prisma.advertisement.findMany({
      where: isAdmin ? undefined : { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: ads });
  } catch (err) {
    console.error("GET ads error:", err);
    return NextResponse.json(
      { success: false, error: "Banners lak chhuah a harsat rih e." },
      { status: 500 }
    );
  }
}

// POST create advertisement (admin only)
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Thuneihna i nei lo." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const targetUrl = formData.get("targetUrl") as string | null;
    const position = formData.get("position") as string | null;

    if (!image || !targetUrl || !position) {
      return NextResponse.json(
        { success: false, error: "Khawngaihin image, link leh position thlang rawh." },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary / mock fallback
    const imageUrl = await uploadImage(buffer);

    // Save to DB
    const ad = await prisma.advertisement.create({
      data: {
        imageUrl,
        targetUrl: targetUrl.trim(),
        position: position.trim(),
        isActive: true,
      },
    });

    revalidateTag("advertisements", "max");

    return NextResponse.json({ success: true, data: ad }, { status: 201 });
  } catch (err) {
    console.error("POST ad error:", err);
    return NextResponse.json(
      { success: false, error: "Ad banner siam a hlawhchham rih e." },
      { status: 500 }
    );
  }
}
