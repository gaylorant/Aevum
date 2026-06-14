"use client";

import { useEffect, useRef, useState } from "react";

const CIRCLE_MEMBERS = [
  { initials: "AK", color: "#2E5BFF", angle: 0 },
  { initials: "SR", color: "#8A2BE2", angle: 72 },
  { initials: "MR", color: "#00CED1", angle: 144 },
  { initials: "PK", color: "#2E5BFF", angle: 216 },
  { initials: "YO", color: "#8A2BE2", angle: 288 },
];

const WHISPERS = [
  "someone in mumbai just exhaled.",
  "a stranger is carrying the same weight.",
  "you are not the only one awake at this hour.",
  "someone else is also figuring it out.",
  "five people. no names. just presence.",
  "the room forgets you when you leave.",
  "real humans, real silence, real safety.",
];

export default function CirclesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [whisperVisible, setWhisperVisible] = useState(true);
  const [orbiting, setOrbiting] = useState(true);
  const mouseRef = useRef({ x: -999, y: -999 });
  const angleRef = useRef(0);

  // Whisper rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setWhisperVisible(false);
      setTimeout(() => {
        setWhisperIndex((i) => (i + 1) % WHISPERS.length);
        setWhisperVisible(true);
      }, 600);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Canvas: ambient particle field — slow drifting dots
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: { x: number; y: number; vx: number; vy: number; r: number; opacity: number; hue: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 2,
        opacity: 0.05 + Math.random() * 0.15,
        hue: [220, 260, 180][Math.floor(Math.random() * 3)],
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const op = dist < 120 ? Math.min(p.opacity + (1 - dist / 120) * 0.3, 0.5) : p.opacity;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${op})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  // Mouse tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Orbit animation
  useEffect(() => {
    if (!orbiting) return;
    let animId: number;
    const animate = () => {
      angleRef.current += 0.003;
      const avatars = document.querySelectorAll(".orbit-avatar");
      avatars.forEach((el, i) => {
        const base = CIRCLE_MEMBERS[i].angle * (Math.PI / 180);
        const angle = base + angleRef.current;
        const radius = 110;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        (el as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [orbiting]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=Syne:wght@800&display=swap');
        @keyframes breathe { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.08);opacity:1} }
        @keyframes ringExpand { 0%{transform:scale(1);opacity:0.4} 100%{transform:scale(2.2);opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes whisperFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(46,91,255,0.4)} 50%{box-shadow:0 0 0 12px rgba(46,91,255,0)} }
        .ring-expand { animation: ringExpand 3s ease-out infinite; }
        .ring-expand-2 { animation: ringExpand 3s ease-out infinite 1s; }
        .ring-expand-3 { animation: ringExpand 3s ease-out infinite 2s; }
        .feature-row:hover { background: rgba(255,255,255,0.04) !important; }
        .notify-btn:hover { background: rgba(46,91,255,0.25) !important; border-color: rgba(46,91,255,0.6) !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#070614", color: "#e2e1ef", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" }}>

        {/* Ambient canvas */}
        <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />

        {/* Background blobs */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 600, height: 600, top: "20%", left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle,rgba(46,91,255,0.12) 0%,transparent 70%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", width: 400, height: 400, bottom: "10%", right: "10%", background: "radial-gradient(circle,rgba(138,43,226,0.1) 0%,transparent 70%)", filter: "blur(60px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "0 auto", padding: "80px 24px 120px" }}>

          {/* Top label */}
          <div style={{ textAlign: "center", marginBottom: 72, animation: "fadeUp 0.8s both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#b8c3ff", background: "rgba(184,195,255,0.06)", border: "1px solid rgba(184,195,255,0.14)", padding: "5px 16px", borderRadius: 9999, marginBottom: 40 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#8A2BE2", boxShadow: "0 0 8px #8A2BE2", display: "inline-block" }} />
              Coming in the next phase
            </div>

            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 400, lineHeight: 1.1, color: "#fff", marginBottom: 20, letterSpacing: "-0.02em" }}>
              Five people.<br /><em style={{ fontStyle: "italic", color: "#b8c3ff" }}>No names.</em>
            </h1>

            <p style={{ fontSize: 17, color: "rgba(226,225,239,0.5)", maxWidth: 480, margin: "0 auto", lineHeight: 1.75 }}>
              Anonymous peer rooms where real humans sit together in silence, or don't. Peer-to-peer — nothing touches a server.
            </p>
          </div>

          {/* The orbit visual */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 80 }}>
            <div style={{ position: "relative", width: 280, height: 280 }}>

              {/* Expanding rings */}
              <div className="ring-expand" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(46,91,255,0.3)" }} />
              <div className="ring-expand-2" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(138,43,226,0.2)" }} />
              <div className="ring-expand-3" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(0,206,209,0.2)" }} />

              {/* Orbit track */}
              <div style={{ position: "absolute", inset: "30px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)" }} />

              {/* Center orb */}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 64, height: 64, borderRadius: "50%", background: "radial-gradient(circle,rgba(46,91,255,0.6) 0%,rgba(138,43,226,0.3) 60%,transparent 100%)", animation: "breathe 4s ease-in-out infinite", boxShadow: "0 0 40px rgba(46,91,255,0.4)" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>e</div>
              </div>

              {/* Orbiting avatars */}
              {CIRCLE_MEMBERS.map((m, i) => (
                <div key={i} className="orbit-avatar" style={{ position: "absolute", top: "50%", left: "50%", marginTop: -16, marginLeft: -16, width: 32, height: 32, borderRadius: "50%", background: `${m.color}33`, border: `1px solid ${m.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: m.color, backdropFilter: "blur(8px)", transition: "none" }}>
                  {m.initials}
                </div>
              ))}
            </div>
          </div>

          {/* Whisper text */}
          <div style={{ textAlign: "center", height: 28, marginBottom: 72 }}>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, fontStyle: "italic", color: "rgba(184,195,255,0.5)", transition: "opacity 0.5s, transform 0.5s", opacity: whisperVisible ? 1 : 0, transform: whisperVisible ? "translateY(0)" : "translateY(8px)" }}>
              "{WHISPERS[whisperIndex]}"
            </p>
          </div>

          {/* Feature rows */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, background: "rgba(255,255,255,0.04)", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 64 }}>
            {[
              { icon: "⭕", label: "Fixed 5-person rooms", desc: "Small enough to feel safe. Big enough to feel less alone." },
              { icon: "🔒", label: "Peer-to-peer audio", desc: "WebRTC via PeerJS — your voice never touches our servers." },
              { icon: "👤", label: "No real names", desc: "Anonymous avatars. You choose what you share, if anything." },
              { icon: "🌊", label: "Room forgets you", desc: "When you leave, you're gone. No logs, no history, nothing." },
            ].map((f, i) => (
              <div key={i} className="feature-row" style={{ padding: "28px 32px", background: "rgba(7,6,20,0.6)", backdropFilter: "blur(20px)", transition: "background 0.2s", cursor: "default" }}>
                <div style={{ fontSize: 22, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{f.label}</div>
                <div style={{ fontSize: 13, color: "rgba(196,197,217,0.6)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Notify CTA */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "rgba(226,225,239,0.3)", marginBottom: 20, fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}>
              असतो मा सद्गमय — lead me from the unreal to the real
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="notify-btn" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, padding: "13px 32px", borderRadius: 9999, background: "rgba(46,91,255,0.15)", border: "1px solid rgba(46,91,255,0.35)", color: "#b8c3ff", cursor: "pointer", transition: "background 0.2s, border-color 0.2s" }}>
                Notify me when it's ready
              </button>
              <a href="/chat" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, padding: "13px 32px", borderRadius: 9999, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(226,225,239,0.5)", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                Talk to Eva for now →
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}