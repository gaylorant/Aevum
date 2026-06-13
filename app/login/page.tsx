"use client";

import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  };

  return (
    <>
      <style>{`
        @keyframes blobDrift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,20px) scale(1.08)} }
        @keyframes blobDrift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-25px,30px) scale(1.06)} }
        @keyframes blobDrift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-30px) scale(1.07)} }
        @keyframes blobDrift4 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,-20px) scale(1.05)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotPulse { 0%,100%{opacity:1;box-shadow:0 0 8px #00FFFF} 50%{opacity:0.5;box-shadow:0 0 18px #00FFFF} }
        .login-card { animation: fadeUp 0.7s 0.1s both; }
        .google-btn { transition: background 0.2s, border-color 0.2s !important; }
        .google-btn:hover { background: rgba(255,255,255,0.09) !important; border-color: rgba(255,255,255,0.2) !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#070614", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "fixed", width: 480, height: 480, top: -100, left: -100, background: "radial-gradient(circle,rgba(46,91,255,0.55) 0%,rgba(46,91,255,0.1) 55%,transparent 75%)", filter: "blur(72px)", animation: "blobDrift1 18s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", width: 440, height: 440, top: -80, right: -100, background: "radial-gradient(circle,rgba(0,206,209,0.5) 0%,rgba(0,206,209,0.08) 55%,transparent 75%)", filter: "blur(70px)", animation: "blobDrift2 22s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", width: 460, height: 460, bottom: -100, left: -80, background: "radial-gradient(circle,rgba(138,43,226,0.5) 0%,rgba(138,43,226,0.08) 55%,transparent 75%)", filter: "blur(72px)", animation: "blobDrift3 20s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", width: 420, height: 420, bottom: -80, right: -100, background: "radial-gradient(circle,rgba(0,255,204,0.45) 0%,rgba(0,255,204,0.08) 55%,transparent 75%)", filter: "blur(68px)", animation: "blobDrift4 24s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />

        <div className="login-card" style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 400, margin: "0 24px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(203,190,255,0.15)", borderRadius: 28, padding: "52px 40px", textAlign: "center", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b8c3ff", background: "rgba(184,195,255,0.07)", border: "1px solid rgba(184,195,255,0.14)", padding: "5px 16px", borderRadius: 9999, marginBottom: 32 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00FFFF", display: "inline-block", animation: "dotPulse 2s ease-in-out infinite" }} />
            Privacy First · AI Wellbeing
          </div>
          <div style={{ fontFamily: "Instrument Serif, serif", fontSize: 40, background: "linear-gradient(270deg,#2e5bff,#00FFFF,#8A2BE2,#00CED1)", backgroundSize: "300% 300%", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", marginBottom: 12, lineHeight: 1 }}>
            sameva
          </div>
          <p style={{ fontSize: 14, color: "rgba(226,225,239,0.4)", marginBottom: 44, lineHeight: 1.75 }}>
            your private space to reflect,<br />grow, and be heard.
          </p>
          <button onClick={handleGoogleLogin} className="google-btn" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "15px 24px", fontSize: 14, fontWeight: 600, color: "#e2e1ef", cursor: "pointer", marginBottom: 28 }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <p style={{ fontSize: 11, color: "rgba(226,225,239,0.18)", lineHeight: 1.8 }}>
            no email stored · no tracking<br />we forget you when you close the tab
          </p>
        </div>
      </div>
    </>
  );
}
