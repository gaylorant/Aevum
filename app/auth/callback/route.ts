import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    // Check if user has completed onboarding (has a username)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();

      // New user — send to onboarding
      if (!profile) {
        return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
      }

      // Returning user — send to chat
      return NextResponse.redirect(new URL("/chat", requestUrl.origin));
    }
  }

  // Something went wrong — send to login
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}