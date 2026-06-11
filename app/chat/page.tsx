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

    // Wait a moment for Supabase to process the hash token
    setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
    }, 1000);
  }, []);

  return <ChatInterface />;
}