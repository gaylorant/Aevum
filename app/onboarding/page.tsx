"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"username" | "password" | "pin">("username");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const checkUsername = async () => {
    if (username.length < 3 || username.length > 20) {
      setError("Username must be 3–20 characters."); return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Only letters, numbers and underscores."); return;
    }
    setLoading(true); setError("");
    const { data } = await supabase.from("users").select("username").eq("username", username).single();
    if (data) { setError("Username already taken."); setLoading(false); return; }
    setLoading(false);
    setStep("password");
  };

  const handleSubmit = async () => {
    if (password.length !== 8) { setError("Password must be exactly 8 characters."); return; }
    if (pin && (pin.length !== 4 || !/^\d+$/.test(pin))) { setError("PIN must be exactly 4 digits."); return; }
    setLoading(true); setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      username,
      password_hash: password,
      pin_hash: pin || null,
    });

    if (insertError) { setError("Something went wrong. Try again."); setLoading(false); return; }
    router.push("/chat");
  };

  return (
    <>
      <style>{`
        @keyframes blobDrift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,20px)} }
        @keyframes blobDrift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,30px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotPulse { 0%,100%{opacity:1;box-shadow:0 0 8px #00FFFF} 50%{opacity:0.5;box-shadow:0 0 18px #00FFFF} }
        .input-field:focus { border-color: rgba(59,130,246,0.5) !important; outline: none; }
        .btn-main:hover { opacity: 0.9; transform: scale(1.02); }
        .btn-main { transition: all 0.2s; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#070614", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", position: "relative", overflow: "hidden" }}>

        <div style={{ position: "fixed", width: 480, height: 480, top: -100, left: -100, background: "radial-gradient(circle,rgba(46,91,255,0.5) 0%,transparent 70%)", filter: "blur(80px)", animation: "blobDrift1 18s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", width: 440, height: 440, bottom: -100, right: -100, background: "radial-gradient(circle,rgba(138,43,226,0.45) 0%,transparent 70%)", filter: "blur(80px)", animation: "blobDrift2 22s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420, margin: "0 24px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(203,190,255,0.15)", borderRadius: 28, padding: "52px 40px", boxShadow: "0 32px 80px rgba(0,0,0,0.5)", animation: "fadeUp 0.7s 0.1s both" }}>

          {/* Steps indicator */}
          <div style={{ display: "flex", gap: 6, marginBottom: 36 }}>
            {["username", "password", "pin"].map((s, i) => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 9999, background: step === s ? "#3b82f6" : ["username","password","pin"].indexOf(step) > i ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
            ))}
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#b8c3ff", background: "rgba(184,195,255,0.07)", border: "1px solid rgba(184,195,255,0.14)", padding: "5px 16px", borderRadius: 9999, marginBottom: 28 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00FFFF", display: "inline-block", animation: "dotPulse 2s ease-in-out infinite" }} />
            One-time setup
          </div>

          {step === "username" && (
            <>
              <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 32, fontWeight: 400, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}>Choose your name</h1>
              <p style={{ fontSize: 13, color: "rgba(226,225,239,0.4)", marginBottom: 32, lineHeight: 1.7 }}>This is how you'll appear in Peer Circles. Pick something you're comfortable with.</p>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(184,195,255,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 8 }}>Username</label>
                <input
                  className="input-field"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && checkUsername()}
                  placeholder="yourname"
                  maxLength={20}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "13px 16px", fontSize: 15, color: "#e2e1ef", fontFamily: "Inter, sans-serif", transition: "border-color 0.2s" }}
                />
                <p style={{ fontSize: 11, color: "rgba(196,197,217,0.35)", marginTop: 6 }}>3–20 characters · letters, numbers, underscores</p>
              </div>
            </>
          )}

          {step === "password" && (
            <>
              <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 32, fontWeight: 400, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}>Set a password</h1>
              <p style={{ fontSize: 13, color: "rgba(226,225,239,0.4)", marginBottom: 32, lineHeight: 1.7 }}>You'll enter this every time you log in with Google. Exactly 8 characters.</p>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(184,195,255,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 8 }}>Password (8 characters)</label>
                <input
                  className="input-field"
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && setStep("pin")}
                  placeholder="••••••••"
                  maxLength={8}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "13px 16px", fontSize: 15, color: "#e2e1ef", fontFamily: "Inter, sans-serif", transition: "border-color 0.2s" }}
                />
              </div>
            </>
          )}

          {step === "pin" && (
            <>
              <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 32, fontWeight: 400, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}>Add a PIN <span style={{ color: "rgba(226,225,239,0.3)", fontSize: 22 }}>(optional)</span></h1>
              <p style={{ fontSize: 13, color: "rgba(226,225,239,0.4)", marginBottom: 32, lineHeight: 1.7 }}>A 4-digit PIN to access your Memory Capsules. Skip if you don't need it.</p>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(184,195,255,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 8 }}>4-digit PIN</label>
                <input
                  className="input-field"
                  type="password"
                  value={pin}
                  onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="••••"
                  maxLength={4}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "13px 16px", fontSize: 15, color: "#e2e1ef", fontFamily: "Inter, sans-serif", transition: "border-color 0.2s" }}
                />
              </div>
            </>
          )}

          {error && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 16 }}>{error}</p>}

          <button
            className="btn-main"
            onClick={step === "username" ? checkUsername : step === "password" ? () => { if (password.length !== 8) { setError("Password must be exactly 8 characters."); return; } setError(""); setStep("pin"); } : handleSubmit}
            disabled={loading}
            style={{ width: "100%", padding: "14px 0", borderRadius: 14, background: "#3b82f6", border: "none", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", boxShadow: "0 0 28px -6px rgba(59,130,246,0.6)", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Checking..." : step === "pin" ? "Finish setup →" : "Continue →"}
          </button>

          {step === "pin" && (
            <button onClick={handleSubmit} style={{ width: "100%", marginTop: 10, padding: "10px 0", borderRadius: 14, background: "transparent", border: "none", fontSize: 13, color: "rgba(196,197,217,0.4)", cursor: "pointer" }}>
              Skip PIN and finish
            </button>
          )}

          {step !== "username" && (
            <button onClick={() => { setStep(step === "pin" ? "password" : "username"); setError(""); }} style={{ width: "100%", marginTop: 8, padding: "8px 0", borderRadius: 14, background: "transparent", border: "none", fontSize: 12, color: "rgba(196,197,217,0.3)", cursor: "pointer" }}>
              ← Back
            </button>
          )}

        </div>
      </div>
    </>
  );
}