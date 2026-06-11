"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
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
      } else if (event === "SIGNED_OUT") {
        subscription.unsubscribe();
        router.replace("/login");
      }
    });

    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      router.replace("/login");
    }, 5000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-400">signing you in...</p>
    </div>
  );
}