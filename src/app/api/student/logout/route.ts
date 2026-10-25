import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  if (process.env.NEXT_PUBLIC_MOCK_SUPABASE === "true") {
    response.cookies.set("mock_logged_out", "true");
  }
  return response;
}
