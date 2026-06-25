import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Only allow Cloudinary URLs for security
  const allowedHost = "res.cloudinary.com";
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (parsedUrl.hostname !== allowedHost) {
      return NextResponse.json({ error: "Invalid file source" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Inject the fl_attachment Cloudinary flag so the browser downloads
  // with the correct filename. The flag sits after /raw/upload/ in the path.
  // e.g. /raw/upload/v123/file.pdf → /raw/upload/fl_attachment/v123/file.pdf
  let finalUrl = url;
  const pathMatch = parsedUrl.pathname.match(/^(\/[^/]+\/[^/]+\/(?:raw|image|video)\/upload\/)(.*)/);
  if (pathMatch) {
    // Only add fl_attachment if not already present
    if (!pathMatch[2].startsWith("fl_attachment")) {
      finalUrl = `${parsedUrl.origin}${pathMatch[1]}fl_attachment/${pathMatch[2]}`;
    }
  }

  // Redirect the browser directly to Cloudinary with the attachment flag.
  // Browsers can access public Cloudinary files; only server-side fetches were blocked (401).
  return NextResponse.redirect(finalUrl, { status: 302 });
}
