import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the employer session cookie
  response.cookies.set({
    name: "employer_session",
    value: "",
    path: "/",
    maxAge: 0,
  });
  
  return response;
}
