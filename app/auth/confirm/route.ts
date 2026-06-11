import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const cookieStore = await cookies();

  const redirectTo = code ? "/chat" : "/login";
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();

      if (!profile) {
        const onboardingResponse = NextResponse.redirect(new URL("/onboarding", request.url));
        cookieStore.getAll().forEach(({ name, value }) => {
          onboardingResponse.cookies.set(name, value);
        });
        return onboardingResponse;
      }
    }
  }

  return response;
}