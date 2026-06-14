"use client";

import { useState } from "react";
import Link from "next/link";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const yearlyMonthly = 125;
  const monthlyPrice = 199;

  return (
    <>
      <style>{`
        @keyframes blobDrift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,25px) scale(1.07)} }
        @keyframes blobDrift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,35px) scale(1.05)} }
        @keyframes blobDrift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(25px,-35px) scale(1.06)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pingDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0.4} }
        .plan-card { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s, border-color 0.3s; }
        .plan-card:hover { transform: translateY(-8px); }
        .feature-row { transition: background 0.2s; }
        .feature-row:hover { background: rgba(255,255,255,0.025); }
        .shimmer-text {
          background: linear-gradient(90deg, #2dd4bf, #3b82f6, #a855f7, #2dd4bf);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .glow-blue { box-shadow: 0 0 40px -8px rgba(59,130,246,0.4); }
        .btn-primary:hover { opacity: 0.9; transform: scale(1.02); }
        .btn-primary { transition: all 0.2s; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#060511", color: "#e2e1ef", fontFamily: "Inter, sans-serif", position: "relative", overflow: "hidden" }}>

        <div style={{ position: "fixed", width: 500, height: 500, top: -120, left: -120, background: "radial-gradient(circle,rgba(46,91,255,0.4) 0%,rgba(46,91,255,0.06) 55%,transparent 75%)", filter: "blur(80px)", animation: "blobDrift1 20s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", width: 460, height: 460, bottom: -100, right: -100, background: "radial-gradient(circle,rgba(138,43,226,0.38) 0%,rgba(138,43,226,0.06) 55%,transparent 75%)", filter: "blur(80px)", animation: "blobDrift2 24s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", width: 420, height: 420, top: "40%", right: "20%", background: "radial-gradient(circle,rgba(0,206,209,0.22) 0%,rgba(0,206,209,0.04) 55%,transparent 75%)", filter: "blur(80px)", animation: "blobDrift3 22s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1080, margin: "0 auto", padding: "0 24px 80px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", paddingTop: 80, paddingBottom: 56, animation: "fadeUp 0.8s 0.1s both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a0ffee", background: "rgba(45,212,191,0.07)", border: "1px solid rgba(45,212,191,0.18)", padding: "5px 16px", borderRadius: 9999, marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2dd4bf", display: "inline-block", animation: "pingDot 2s ease-in-out infinite" }} />
              Transparent Pricing · No Hidden Fees
            </div>
            <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: "clamp(36px,6vw,64px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, marginBottom: 16, letterSpacing: "-0.02em" }}>
              Start free.<br /><span className="shimmer-text">Grow when you are ready.</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(196,197,217,0.65)", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.75 }}>
              Privacy-first, always. No ads. No data selling. Just honest pricing for deeper growth.
            </p>

            {/* Billing toggle */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999, padding: "6px 8px" }}>
              <button onClick={() => setBilling("monthly")} style={{ padding: "8px 20px", borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "Plus Jakarta Sans, sans-serif", transition: "all 0.3s", background: billing === "monthly" ? "rgba(59,130,246,0.2)" : "transparent", color: billing === "monthly" ? "#93c5fd" : "rgba(196,197,217,0.5)", boxShadow: billing === "monthly" ? "0 0 0 1px rgba(59,130,246,0.3)" : "none" }}>
                Monthly
              </button>
              <button onClick={() => setBilling("yearly")} style={{ padding: "8px 20px", borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "Plus Jakarta Sans, sans-serif", transition: "all 0.3s", background: billing === "yearly" ? "rgba(45,212,191,0.15)" : "transparent", color: billing === "yearly" ? "#2dd4bf" : "rgba(196,197,217,0.5)", boxShadow: billing === "yearly" ? "0 0 0 1px rgba(45,212,191,0.3)" : "none", display: "flex", alignItems: "center", gap: 8 }}>
                Yearly
                {billing === "yearly" && <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(45,212,191,0.2)", color: "#2dd4bf", padding: "2px 8px", borderRadius: 9999, animation: "fadeIn 0.3s ease both" }}>37% off</span>}
              </button>
            </div>
            {billing === "yearly" && (
              <p style={{ fontSize: 11, color: "rgba(45,212,191,0.6)", marginTop: 10, animation: "fadeIn 0.3s ease both" }}>
                Rs.1,499/year - saves you Rs.889
              </p>
            )}
          </div>

          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 64, animation: "fadeUp 0.8s 0.3s both" }}>

            {/* Free */}
            <div className="plan-card" onMouseEnter={() => setHoveredPlan("free")} onMouseLeave={() => setHoveredPlan(null)} style={{ background: "rgba(255,255,255,0.022)", backdropFilter: "blur(24px)", border: `1px solid ${hoveredPlan === "free" ? "rgba(100,116,139,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius: 24, padding: "40px 36px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(100,116,139,0.3),transparent)" }} />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#64748b", marginBottom: 20 }}>Free Core</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 56, fontWeight: 400, color: "#fff", lineHeight: 1 }}>Rs.0</span>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 32 }}>Forever free · guest mode</p>
              <Link href="/chat" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "13px 0", borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 14, fontWeight: 700, color: "#e2e1ef", textDecoration: "none", fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: 32 }}>
                Start for free
              </Link>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                {["Guest mode — no account required","Private AI chat · zero server memory","50 reflections per day","1 Peer Circle per day","Lifebook tools (local-only)","Memory Capsules (key insights only)","Crisis support shortcuts"].map((f, i) => (
                  <div key={i} className="feature-row" style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "5px 8px", borderRadius: 10 }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(100,116,139,0.12)", border: "1px solid rgba(100,116,139,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <span style={{ fontSize: 13.5, color: "rgba(196,197,217,0.65)", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium */}
            <div className="plan-card glow-blue" onMouseEnter={() => setHoveredPlan("premium")} onMouseLeave={() => setHoveredPlan(null)} style={{ background: "rgba(59,130,246,0.06)", backdropFilter: "blur(32px)", border: `1px solid ${hoveredPlan === "premium" ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.25)"}`, borderRadius: 24, padding: "40px 36px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(59,130,246,0.6),rgba(45,212,191,0.4),transparent)" }} />
              <div style={{ position: "absolute", top: 20, right: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#93c5fd", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", padding: "4px 12px", borderRadius: 9999 }}>Most Popular</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#93c5fd", marginBottom: 20 }}>Premium Growth</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 56, fontWeight: 400, color: "#fff", lineHeight: 1 }}>Rs.{billing === "yearly" ? yearlyMonthly : monthlyPrice}</span>
                <span style={{ fontSize: 16, color: "#64748b", marginBottom: 10 }}>/mo</span>
                {billing === "monthly" && <span style={{ fontSize: 13, color: "#64748b", textDecoration: "line-through", marginBottom: 10, marginLeft: 4 }}>Rs.299</span>}
              </div>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 32 }}>{billing === "yearly" ? "Rs.1,499 billed yearly · cancel anytime" : "Cancel anytime"}</p>
              <button className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "14px 0", borderRadius: 14, background: "#3b82f6", border: "none", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: 32, boxShadow: "0 0 28px -6px rgba(59,130,246,0.7)" }}>
                Get Premium
              </button>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                {["Everything in Free Core","Unlimited reflections per day","5 Peer Circles per day","Priority circle matching","Lifebook sync across devices","Advanced export (CSV / JSON)","Early access to self-hosted AI (Qwen)","Multiple AI personas (coming soon)","Priority support"].map((f, i) => (
                  <div key={i} className="feature-row" style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "5px 8px", borderRadius: 10 }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <span style={{ fontSize: 13.5, color: i === 0 ? "#93c5fd" : "rgba(196,197,217,0.8)", lineHeight: 1.5, fontWeight: i === 0 ? 600 : 400 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div style={{ animation: "fadeUp 0.8s 0.5s both" }}>
            <h2 style={{ fontFamily: "Instrument Serif, serif", fontSize: 28, fontWeight: 400, color: "#fff", textAlign: "center", marginBottom: 8 }}>Compare plans</h2>
            <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 32 }}>We don't hide what you get</p>
            <div style={{ background: "rgba(255,255,255,0.018)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Feature</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textAlign: "center" as const, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Free</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#93c5fd", textAlign: "center" as const, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Premium</span>
              </div>
              {[
                ["Private AI chat with Eva","✓","✓"],
                ["Daily reflections","50/day","Unlimited"],
                ["Peer Circles","1/day","5/day"],
                ["Memory Capsules","✓","✓"],
                ["Lifebook tools","Local only","Sync + export"],
                ["Zero server memory","✓","✓"],
                ["No account required","✓","Optional"],
                ["Self-hosted AI (Qwen)","—","Early access"],
                ["Multiple AI personas","—","Coming soon"],
                ["Priority support","—","✓"],
              ].map(([feature, free, premium], i) => (
                <div key={i} className="feature-row" style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", padding: "14px 24px", borderBottom: i < 9 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <span style={{ fontSize: 13.5, color: "rgba(196,197,217,0.75)" }}>{feature}</span>
                  <span style={{ fontSize: 13, color: free === "✓" ? "#4ade80" : free === "—" ? "#374151" : "#94a3b8", textAlign: "center" as const, fontWeight: free === "✓" ? 600 : 400 }}>{free}</span>
                  <span style={{ fontSize: 13, color: premium === "✓" ? "#4ade80" : premium === "—" ? "#374151" : "#93c5fd", textAlign: "center" as const, fontWeight: premium !== "—" ? 600 : 400 }}>{premium}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy note */}
          <div style={{ marginTop: 48, padding: "28px 32px", background: "rgba(45,212,191,0.04)", border: "1px solid rgba(45,212,191,0.12)", borderRadius: 20, display: "flex", alignItems: "flex-start", gap: 16, animation: "fadeUp 0.8s 0.7s both" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" fill="none" stroke="#2dd4bf" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#2dd4bf", marginBottom: 4 }}>Your privacy never changes with your plan</p>
              <p style={{ fontSize: 13, color: "rgba(196,197,217,0.6)", lineHeight: 1.65 }}>Free or Premium — no chat history is ever stored on our servers. No ads. No data selling. No behavioral profiling. Privacy is the product, not a feature tier.</p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: 48, textAlign: "center", animation: "fadeUp 0.8s 0.9s both" }}>
            <p style={{ fontFamily: "Instrument Serif, serif", fontSize: 14, color: "rgba(184,195,255,0.3)", marginBottom: 12, fontStyle: "italic" }}>
              असतो मा सद्गमय — Lead me from the unreal to the real
            </p>
            <Link href="/chat" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 36px", borderRadius: 9999, background: "#3b82f6", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", fontFamily: "Plus Jakarta Sans, sans-serif", boxShadow: "0 0 40px -8px rgba(59,130,246,0.6)" }}>
              Start for free — no account needed
            </Link>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>No credit card. No email. Just open and reflect.</p>
          </div>

        </div>
      </div>
    </>
  );
}