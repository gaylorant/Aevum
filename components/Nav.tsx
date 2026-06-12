"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/circles", label: "Circles" },
  { href: "/lifebook", label: "Lifebook" },
  { href: "/pricing", label: "Pricing" },
];

interface Capsule {
  id: string;
  content: string;
  created_at: string;
}

interface UserProfile {
  username: string;
}

export default function Nav() {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loadingCapsules, setLoadingCapsules] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const loadProfile = async (userId: string) => {
      const { data: p } = await supabase
        .from("users")
        .select("username")
        .eq("id", userId)
        .single();
      if (p) {
        setProfile(p);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setCapsules([]);
      } else if (session?.user && event === "SIGNED_IN") {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const openModal = async () => {
    setShowModal(true);
    if (!user) return;
    setLoadingCapsules(true);
    const supabase = getSupabaseClient();
    const { data } = await supabase
      ?.from("memory_capsules")
      .select("id, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }) ?? { data: [] };
    setCapsules(data ?? []);
    setLoadingCapsules(false);
  };

  const deleteCapsule = async (id: string) => {
    const supabase = getSupabaseClient();
    await supabase?.from("memory_capsules").delete().eq("id", id);
    setCapsules((prev) => prev.filter((c) => c.id !== id));
  };

  const handleLogin = async () => {
    const supabase = getSupabaseClient();
    await supabase?.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase?.auth.signOut();
    setShowModal(false);
    setUser(null);
    setProfile(null);
    setCapsules([]);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
      " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <header className="border-b border-sameva-border bg-sameva-surface/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-sameva-ink">
            sameva
          </Link>
          <div className="flex items-center gap-2">
            <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-sameva-muted transition-colors hover:bg-sameva-accent/10 hover:text-sameva-accent"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              onClick={openModal}
              className="ml-2 rounded-lg px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition"
            >
              {user ? (profile?.username ?? "account") : "log in"}
            </button>
          </div>
        </nav>
      </header>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm pt-16 pr-4 sm:pr-8"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {!user ? (
              <>
                <h2 className="text-base font-semibold text-gray-900 mb-1">your capsules, saved.</h2>
                <p className="text-sm text-gray-500 mb-4">
                  log in to save Memory Capsules across sessions and access them anytime.
                </p>
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-700 transition mb-3"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <p className="text-xs text-center text-gray-400">
                  no email stored. no tracking. your google account is just an ID.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">
                    hey, {profile?.username ?? "you"} 👋
                  </h2>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-400 hover:text-red-500 transition"
                  >
                    log out
                  </button>
                </div>

                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">memory capsules</p>

                {loadingCapsules ? (
                  <p className="text-sm text-gray-400 text-center py-4">loading...</p>
                ) : capsules.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    no capsules saved yet. save an insight during a chat.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {capsules.map((c) => (
                      <div key={c.id} className="flex items-start justify-between gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <div>
                          <p className="text-sm text-gray-800 leading-snug">{c.content}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(c.created_at)}</p>
                        </div>
                        <button
                          onClick={() => deleteCapsule(c.id)}
                          className="text-gray-300 hover:text-red-400 transition text-xs mt-0.5 shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}