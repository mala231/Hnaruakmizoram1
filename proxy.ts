import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Protect Employer Dashboard and Job Posting form
  if (pathname.startsWith("/dashboard") || pathname === "/post-job") {
    const sessionCookie = request.cookies.get("employer_session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    const payload = await verifyJWT(sessionCookie);
    if (!payload || payload.role !== "employer") {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("employer_session");
      return response;
    }
  }

  // 2. Protect Admin Dashboard (excluding the login page itself)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    
    const payload = await verifyJWT(sessionCookie);
    if (!payload || payload.role !== "admin") {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/post-job"],
};
