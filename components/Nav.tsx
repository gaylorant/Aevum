"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loadingCapsules, setLoadingCapsules] = useState(false);
  const [logoHover, setLogoHover] = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);

  
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const loadProfile = async (userId: string) => {
      const { data: p } = await supabase
        .from("users")
        .select("username")
        .eq("id", userId)
        .single();
      if (p) setProfile(p);
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
  
  if (pathname === "/chat" || pathname === "/login" || pathname === "/onboarding") return null;


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
        queryParams: { access_type: "offline", prompt: "consent" },
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
    return (
      d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
      " · " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <>
      <style>{`
        @keyframes logoFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .nav-logo {
          font-family: 'Instrument Serif', serif;
          font-size: 26px;
          background: linear-gradient(270deg, #2e5bff, #00FFFF, #8A2BE2, #00CED1);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          color: rgba(226,225,239,0.85);
          transition: color 1.5s ease, background-position 1.5s ease;
          background-position: 0% 50%;
          text-decoration: none;
        }
        .nav-logo:hover {
          color: transparent;
          background-position: 100% 50%;
        }
        .nav-link {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: rgba(226,225,239,0.45);
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.2s;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .nav-link:hover { color: rgba(226,225,239,0.9); }
        .nav-btn-ghost {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          padding: 9px 22px;
          border-radius: 9999px;
          background: transparent;
          color: #cbbeff;
          border: 1px solid rgba(203,190,255,0.22);
          cursor: pointer;
          backdrop-filter: blur(12px);
          transition: border-color 0.2s, background 0.2s;
        }
        .nav-btn-ghost:hover { border-color: rgba(203,190,255,0.45); background: rgba(203,190,255,0.06); }
        .nav-btn-primary {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          padding: 9px 22px;
          border-radius: 9999px;
          background: #2E5BFF;
          color: #efefff;
          border: none;
          cursor: pointer;
          box-shadow: 0 0 24px -6px #2E5BFF;
          transition: transform 0.15s, box-shadow 0.2s;
        }
        .nav-btn-primary:hover { transform: scale(1.04); box-shadow: 0 0 36px -6px #2E5BFF; }
        .nav-user-btn {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          padding: 9px 22px;
          border-radius: 9999px;
          background: rgba(46,91,255,0.15);
          color: #b8c3ff;
          border: 1px solid rgba(46,91,255,0.3);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .nav-user-btn:hover { background: rgba(46,91,255,0.25); border-color: rgba(46,91,255,0.5); }
        .modal-capsule:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(7,6,20,0.75)",
        backdropFilter: "blur(28px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 40px rgba(0,0,0,0.3)",
      }}>
        <nav style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: 68 }}>

          {/* Logo */}
          <Link href="/" className="nav-logo">
            sameva
          </Link>

          {/* Links */}
          <ul style={{ display: "flex", alignItems: "center", gap: 4, listStyle: "none", margin: 0, padding: 0 }}>
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="nav-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user ? (
              <button onClick={openModal} className="nav-user-btn">
                {profile?.username ?? "account"}
              </button>
            ) : (
              <>
                <button onClick={openModal} className="nav-btn-ghost">
                  Sign In
                </button>
                <Link href="/chat">
                  <button className="nav-btn-primary">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", paddingTop: 76, paddingRight: 24 }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: "rgba(10,9,28,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(203,190,255,0.15)", borderRadius: 20, width: "100%", maxWidth: 340, padding: 20, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {!user ? (
              <>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e2e1ef", marginBottom: 6 }}>your capsules, saved.</h2>
                <p style={{ fontSize: 13, color: "rgba(226,225,239,0.4)", marginBottom: 20, lineHeight: 1.6 }}>
                  log in to save Memory Capsules across sessions and access them anytime.
                </p>
                <button
                  onClick={handleLogin}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#e2e1ef", cursor: "pointer", marginBottom: 14 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <p style={{ fontSize: 11, color: "rgba(226,225,239,0.2)", textAlign: "center" }}>
                  no email stored. no tracking. your google account is just an ID.
                </p>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e2e1ef" }}>
                    hey, {profile?.username ?? "you"} 👋
                  </h2>
                  <button onClick={handleLogout} style={{ fontSize: 11, color: "rgba(226,225,239,0.3)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(226,225,239,0.3)")}
                  >
                    log out
                  </button>
                </div>

                <p style={{ fontSize: 10, color: "rgba(226,225,239,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>memory capsules</p>

                {loadingCapsules ? (
                  <p style={{ fontSize: 13, color: "rgba(226,225,239,0.3)", textAlign: "center", padding: "16px 0" }}>loading...</p>
                ) : capsules.length === 0 ? (
                  <p style={{ fontSize: 13, color: "rgba(226,225,239,0.3)", textAlign: "center", padding: "16px 0", lineHeight: 1.6 }}>
                    no capsules saved yet.<br />save an insight during a chat.
                  </p>
                ) : (
                  <div style={{ maxHeight: 280, overflowY: "auto" }}>
                    {capsules.map((c) => (
                      <div key={c.id} className="modal-capsule" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 12px", marginBottom: 8, transition: "background 0.2s" }}>
                        <div>
                          <p style={{ fontSize: 13, color: "#e2e1ef", lineHeight: 1.5, marginBottom: 4 }}>{c.content}</p>
                          <p style={{ fontSize: 10, color: "rgba(226,225,239,0.25)" }}>{formatDate(c.created_at)}</p>
                        </div>
                        <button onClick={() => deleteCapsule(c.id)} style={{ fontSize: 11, color: "rgba(226,225,239,0.2)", background: "none", border: "none", cursor: "pointer", flexShrink: 0, marginTop: 2, transition: "color 0.2s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(226,225,239,0.2)")}
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