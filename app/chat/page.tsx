"use client";

import { useEffect } from "react";
import ChatInterface from "@/components/chat/ChatInterface";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function ChatPage() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;

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
          window.location.href = "/onboarding";
        } else {
          window.history.replaceState(null, "", "/chat");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <ChatInterface />;
}