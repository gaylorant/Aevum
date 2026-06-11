"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const hash = window.location.hash;

    if (hash && hash.includes("access_token")) {
      // Parse the hash fragment manually
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(async ({ data, error }) => {
          if (error || !data.session) {
            router.replace("/login");
            return;
          }

          const { data: profile } = await supabase
            .from("users")
            .select("username")
            .eq("id", data.session.user.id)
            .single();

          if (!profile) {
            router.replace("/onboarding");
          } else {
            router.replace("/chat");
          }
        });
      } else {
        router.replace("/login");
      }
    } else {
      // No hash — check if already signed in
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session) {
          router.replace("/login");
          return;
        }
        const { data: profile } = await supabase
          .from("users")
          .select("username")
          .eq("id", session.user.id)
          .single();

        if (!profile) {
          router.replace("/onboarding");
        } else {
          router.replace("/chat");
        }
      });
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-400">signing you in...</p>
    </div>
  );
}