import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) {
    return NextResponse.json({ error: "File storage is not configured" }, { status: 500 });
  }

  let allowedHost: string;
  try {
    allowedHost = new URL(publicUrl).hostname;
  } catch {
    return NextResponse.json({ error: "Invalid file storage configuration" }, { status: 500 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (parsedUrl.hostname !== allowedHost) {
      return NextResponse.json({ error: "Invalid file source" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Redirect the browser directly to the public R2 URL.
  return NextResponse.redirect(parsedUrl.toString(), { status: 302 });
}
