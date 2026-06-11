"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      alert("NO SUPABASE CLIENT");
      return;
    }

    const hash = window.location.hash;
    alert("HASH: " + hash.substring(0, 100));

    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      alert("ACCESS TOKEN EXISTS: " + !!accessToken + " | REFRESH TOKEN EXISTS: " + !!refreshToken);

      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(async ({ data, error }) => {
          alert("SET SESSION ERROR: " + JSON.stringify(error) + " | USER: " + data?.session?.user?.email);
          if (error || !data.session) {
            router.replace("/login");
            return;
          }
          router.replace("/chat");
        });
      }
    } else {
      alert("NO HASH FOUND — going to login");
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-400">signing you in...</p>
    </div>
  );
}