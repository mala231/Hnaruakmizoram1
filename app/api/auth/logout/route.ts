import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const url = new URL("/", request.url);
  const response = NextResponse.redirect(url, { status: 303 });
  
  // Clear the employer session cookie
  response.cookies.delete("employer_session");
  
  return response;
}
