"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

const CRISIS_KEYWORDS = [
  "kill myself", "killing myself", "suicide", "suicidal",
  "want to die", "don't want to exist", "end it all", "end my life",
  "jump off", "jump from", "not worth living", "want to disappear forever",
  "no reason to live",
];

function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

const FREE_TOKENS_PER_DAY = 50;

function getTodayKey() {
  return `aevum_tokens_${new Date().toISOString().slice(0, 10)}`;
}
function getTokensUsedToday(): number {
  try { return parseInt(localStorage.getItem(getTodayKey()) ?? "0", 10); } catch { return 0; }
}
function incrementTokensUsed() {
  try {
    const key = getTodayKey();
    const used = getTokensUsedToday();
    localStorage.setItem(key, String(used + 1));
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("aevum_tokens_") && k !== key) localStorage.removeItem(k);
    }
  } catch {}
}

function getCurrentTimeContext(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  const timeStr = `${hours12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  let timeOfDay = "";
  if (hours >= 5 && hours < 12) timeOfDay = "morning";
  else if (hours >= 12 && hours < 17) timeOfDay = "afternoon";
  else if (hours >= 17 && hours < 21) timeOfDay = "evening";
  else timeOfDay = "night";
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return `Current time: ${timeStr} IST (${timeOfDay}, ${days[now.getDay()]})`;
}

function getTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
}

type Mood = "neutral" | "anxious" | "stressed" | "low" | "calm" | "hopeful";

const MOODS: Record<Mood, { label: string; desc: string; col: string; h1: number[]; h2: number[] }> = {
  neutral:  { h1:[200,220,240], h2:[220,200,260], label:"navigating the fog",       desc:"tension beneath the surface",      col:"#a0ffee" },
  anxious:  { h1:[260,240,280], h2:[280,300,240], label:"heart's running fast",      desc:"nervous energy, mind spiralling",  col:"#c4b5fd" },
  stressed: { h1:[220,200,240], h2:[200,220,180], label:"pulled in all directions",  desc:"too much, not enough space",       col:"#93c5fd" },
  low:      { h1:[220,200,240], h2:[240,220,260], label:"sitting in the quiet",      desc:"a heaviness words don't fit",      col:"#a5b4fc" },
  calm:     { h1:[160,180,200], h2:[180,200,160], label:"settling into stillness",   desc:"something softening",              col:"#5eead4" },
  hopeful:  { h1:[170,190,210], h2:[190,210,170], label:"light coming through",      desc:"something is lifting",             col:"#86efac" },
};

function inferMood(text: string): Mood {
  const t = text.toLowerCase();
  if (/(anxious|panic|nervous|scared|worried)/.test(t)) return "anxious";
  if (/(stressed|overwhelm|pressure|too much)/.test(t)) return "stressed";
  if (/(sad|low|down|empty|numb|tired)/.test(t)) return "low";
  if (/(better|good|okay|hopeful|improving)/.test(t)) return "hopeful";
  if (/(calm|peace|relax|breath)/.test(t)) return "calm";
  return "neutral";
}

const SUGGESTIONS = [
  { title: "something's off", sub: "can't put a finger on it", text: "i've been feeling really anxious lately and i don't know why", color: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.18)", stroke: "#93c5fd", icon: "circle-info" },
  { title: "exam pressure", sub: "brain refusing to cooperate", text: "exams are coming up and i feel paralysed, like i can't start anything", color: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.18)", stroke: "#d8b4fe", icon: "book" },
  { title: "falling behind", sub: "the comparison spiral", text: "i feel like i'm falling behind everyone and it's exhausting", color: "rgba(45,212,191,0.08)", border: "rgba(45,212,191,0.15)", stroke: "#2dd4bf", icon: "clock" },
  { title: "home is complicated", sub: "carrying it into everything", text: "things at home are complicated and it's affecting everything", color: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.15)", stroke: "#fb923c", icon: "home" },
  { title: "just talking", sub: "no agenda, just here", text: "i just need to talk, nothing specific", color: "rgba(45,212,191,0.08)", border: "rgba(45,212,191,0.15)", stroke: "#a0ffee", icon: "chat" },
];

export default function ChatInterface() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState<Mood>("neutral");
  const [tokensUsed, setTokensUsed] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisCount, setCrisisCount] = useState(0);
  const [userCapsules, setUserCapsules] = useState<string[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [savedCapsule, setSavedCapsule] = useState(false);
  const [profile, setProfile] = useState<{ username: string; is_premium: boolean } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showChips, setShowChips] = useState(true);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const orbRef = useRef<HTMLCanvasElement>(null);
  const orbTRef = useRef(0);
  const moodRef = useRef<Mood>("neutral");

  // Sync mood ref
  useEffect(() => { moodRef.current = mood; }, [mood]);

  // Load user data
  useEffect(() => {
    setTokensUsed(getTokensUsedToday());
    const supabase = getSupabaseClient();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      setUserId(session.user.id);
      const [capRes, profRes] = await Promise.all([
        supabase.from("memory_capsules").select("content").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("users").select("username, is_premium, message_count").eq("id", session.user.id).single(),
      ]);
      if (capRes.data) setUserCapsules(capRes.data.map((c: { content: string }) => c.content));
      if (profRes.data) {
        setProfile({ username: profRes.data.username, is_premium: profRes.data.is_premium });
        setMessageCount(profRes.data.message_count ?? 0);
      }
    });
  }, []);

  // Opening message
  useEffect(() => {
    setMessages([{
      role: "assistant",
      content: "hey. glad you're here.\n\nwhat's on your mind today? take your time — no rush.",
      time: getTime(),
    }]);
  }, []);

  // Orb animation
  useEffect(() => {
    const canvas = orbRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    function draw() {
      orbTRef.current += 0.006;
      const t = orbTRef.current;
      const m = MOODS[moodRef.current];
      ctx!.clearRect(0, 0, 100, 100);
      for (let i = 0; i < 3; i++) {
        const ox = 50 + 12 * Math.sin(t * 0.7 + i * 2.1);
        const oy = 50 + 12 * Math.cos(t * 0.5 + i * 1.7);
        const h = m.h1[i] + 10 * Math.sin(t * 0.4 + i);
        const h2 = m.h2[i] + 8 * Math.cos(t * 0.3 + i);
        const g = ctx!.createRadialGradient(ox, oy, 0, 50, 50, 46 + 4 * Math.sin(t * 0.6));
        g.addColorStop(0, `hsla(${h},80%,60%,${0.65 - i * 0.14})`);
        g.addColorStop(0.5, `hsla(${h2},75%,45%,${0.35 - i * 0.09})`);
        g.addColorStop(1, `hsla(${h2 + 20},65%,25%,0)`);
        ctx!.beginPath(); ctx!.arc(50, 50, 46 + 4 * Math.sin(t * 0.8 + i), 0, Math.PI * 2);
        ctx!.fillStyle = g; ctx!.fill();
      }
      const rim = ctx!.createRadialGradient(38, 30, 1, 50, 50, 47);
      rim.addColorStop(0, "rgba(255,255,255,0.22)");
      rim.addColorStop(0.3, "rgba(255,255,255,0.04)");
      rim.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.beginPath(); ctx!.arc(50, 50, 47, 0, Math.PI * 2);
      ctx!.fillStyle = rim; ctx!.fill();
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Wipe on close
  useEffect(() => {
    const handleUnload = () => setMessages([]);
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // Auto-resize textarea
  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const used = getTokensUsedToday();
    const limit = profile?.is_premium ? 999 : FREE_TOKENS_PER_DAY;
    if (used >= limit) { setShowUpgrade(true); return; }

    if (detectCrisis(text)) {
      const newCount = crisisCount + 1;
      setCrisisCount(newCount);
      if (newCount >= 3) setShowCrisisModal(true);
    }

    const newMood = inferMood(text);
    setMood(newMood);
    setShowChips(false);
    setSelectedChip(null);

    const userMsg: Message = { role: "user", content: text, time: getTime() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
    setLoading(true);
    incrementTokensUsed();
    setTokensUsed(used + 1);

    // Increment message_count in Supabase
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    if (userId) {
      const supabase = getSupabaseClient();
      supabase?.from("users").update({ message_count: newCount }).eq("id", userId);
    }

    const requestBody = JSON.stringify({
      messages: updatedMessages,
      timeContext: getCurrentTimeContext(),
      capsules: userCapsules,
      messageCount: newCount,
    });

    try {
      let res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody });
      if (!res.ok) { await new Promise(r => setTimeout(r, 2000)); res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody }); }
      if (!res.ok) { await new Promise(r => setTimeout(r, 3000)); res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody }); }
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply ?? "lost my train of thought, say that again?", time: getTime() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "lost my train of thought, say that again?", time: getTime() }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, crisisCount, profile, userCapsules, messageCount, userId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const saveMemoryCapsule = async () => {
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    if (!lastUser) return;
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase?.auth.getSession() ?? { data: { session: null } };
      await supabase?.from("memory_capsules").insert({
        content: lastUser.content,
        created_at: new Date().toISOString(),
        user_id: session?.user?.id ?? null,
      });
      if (session?.user) setUserCapsules(prev => [lastUser.content, ...prev]);
      setSavedCapsule(true);
      setTimeout(() => setSavedCapsule(false), 3000);
    } catch {}
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "hey. new space, fresh start.\n\nwhat's on your mind?", time: getTime() }]);
    setMood("neutral");
    setCrisisCount(0);
    setShowChips(true);
    setSelectedChip(null);
  };

  const tokensLeft = Math.max(0, FREE_TOKENS_PER_DAY - tokensUsed);
  const tokenPct = Math.min((tokensUsed / FREE_TOKENS_PER_DAY) * 100, 100);
  const currentMood = MOODS[mood];
  const userInitials = profile?.username?.slice(0, 2).toUpperCase() ?? "SR";

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#060511", fontFamily: "'Inter', sans-serif", color: "#e2e1ef" }}>

      {/* Background blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 520, height: 520, top: "10%", left: "15%", background: "radial-gradient(circle,rgba(30,144,255,0.45) 0%,rgba(0,40,255,0.12) 50%,transparent 75%)", filter: "blur(90px)", animation: "blobDrift 20s ease-in-out infinite" }} />
        <div className="absolute rounded-full" style={{ width: 480, height: 480, top: "40%", right: "10%", background: "radial-gradient(circle,rgba(168,85,247,0.4) 0%,rgba(109,40,217,0.1) 50%,transparent 75%)", filter: "blur(90px)", animation: "blobDrift 25s ease-in-out infinite", animationDelay: "-8s" }} />
        <div className="absolute rounded-full" style={{ width: 440, height: 440, bottom: "5%", left: "30%", background: "radial-gradient(circle,rgba(6,182,212,0.35) 0%,rgba(0,168,204,0.1) 50%,transparent 75%)", filter: "blur(90px)", animation: "blobDrift 22s ease-in-out infinite", animationDelay: "-14s" }} />
      </div>

      <style>{`
        @keyframes blobDrift { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.06)} 66%{transform:translate(-20px,25px) scale(0.96)} }
        @keyframes sideIn { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:translateX(0)} }
        @keyframes topIn { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes botIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes msgIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.05);opacity:0.9} }
        @keyframes fadePulse { 0%,100%{opacity:0.65} 50%{opacity:1} }
        @keyframes tdot { 0%,80%,100%{transform:translateY(0);opacity:0.5} 40%{transform:translateY(-5px);opacity:1} }
        @keyframes statusPulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.4)} 50%{box-shadow:0 0 0 4px rgba(74,222,128,0)} }
        @keyframes sbSpin { 0%,100%{box-shadow:0 0 16px rgba(59,130,246,0.4)} 50%{box-shadow:0 0 36px rgba(59,130,246,0.7)} }
        .msg-in { animation: msgIn 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .tdot1 { animation: tdot 1.8s ease-in-out infinite; }
        .tdot2 { animation: tdot 1.8s ease-in-out infinite 0.22s; }
        .tdot3 { animation: tdot 1.8s ease-in-out infinite 0.44s; }
        .sug-item:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.06); transform: translateX(2px); }
        .chip-item:hover { background: rgba(45,212,191,0.15); border-color: rgba(45,212,191,0.4); transform: translateY(-1px); }
        .msgs-scroll::-webkit-scrollbar { width: 3px; }
        .msgs-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 3px; }
      `}</style>

      {/* Shell */}
      <div className="relative z-10 flex h-full">

        {/* SIDEBAR */}
        <aside className="hidden md:flex flex-col flex-shrink-0 overflow-hidden" style={{ width: 268, background: "rgba(5,4,14,0.7)", backdropFilter: "blur(48px)", borderRight: "1px solid rgba(255,255,255,0.05)", animation: "sideIn 0.9s cubic-bezier(0.22,1,0.36,1) both" }}>
          
          {/* Brand */}
          <Link href="/" className="block px-5 pt-5 pb-1 flex-shrink-0" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: "#94a3b8", letterSpacing: "0.01em", textDecoration: "none", background: "linear-gradient(90deg,#2dd4bf,#3b82f6,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            sameva
          </Link>

          {/* Mood orb */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", marginTop: 8 }}>
            <div className="relative" style={{ width: 100, height: 100, marginBottom: 12 }}>
              <canvas ref={orbRef} width={100} height={100} className="absolute inset-0 rounded-full" />
              <div className="absolute rounded-full" style={{ inset: -7, border: "1px solid rgba(255,255,255,0.06)", animation: "ringPulse 4s ease-in-out infinite" }} />
              <div className="absolute rounded-full" style={{ inset: -16, border: "1px solid rgba(255,255,255,0.03)", animation: "ringPulse 6s ease-in-out infinite 1.5s" }} />
            </div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: currentMood.col, animation: "fadePulse 3s ease-in-out infinite" }}>
              {currentMood.label}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", textAlign: "center", maxWidth: 155, lineHeight: 1.5, marginTop: 4 }}>
              {currentMood.desc}
            </div>
          </div>

          {/* Nav links */}
          <div className="flex-shrink-0 px-3 pt-3">
            <Link href="/chat" className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1 no-underline" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 28, height: 28, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <svg width="13" height="13" fill="none" stroke="#93c5fd" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <div><div style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Eva Sanctuary</div><div style={{ fontSize: 10.5, color: "#64748b" }}>private ai chat</div></div>
            </Link>
            <Link href="/circles" className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1 no-underline sug-item" style={{ border: "1px solid transparent" }}>
              <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 28, height: 28, background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.18)" }}>
                <svg width="13" height="13" fill="none" stroke="#2dd4bf" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <div><div style={{ fontSize: 12, fontWeight: 600, color: "#e2e1ef", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Peer Circles</div><div style={{ fontSize: 10.5, color: "#64748b" }}>anonymous rooms</div></div>
            </Link>
            <Link href="/pricing" className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1 no-underline sug-item" style={{ border: "1px solid transparent" }}>
              <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 28, height: 28, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.18)" }}>
                <svg width="13" height="13" fill="none" stroke="#d8b4fe" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              </div>
              <div><div style={{ fontSize: 12, fontWeight: 600, color: "#e2e1ef", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pricing</div><div style={{ fontSize: 10.5, color: "#64748b" }}>free · premium ₹199</div></div>
            </Link>
          </div>

          {/* Suggestions */}
          <div className="flex-1 overflow-y-auto px-3 pt-3" style={{ scrollbarWidth: "none" }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", color: "#64748b", textTransform: "uppercase", padding: "0 5px", marginBottom: 9 }}>start here</div>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => { setInput(s.text); textareaRef.current?.focus(); }} className="w-full text-left flex items-start gap-2 px-3 py-2 rounded-xl mb-1 transition-all duration-300 sug-item" style={{ border: "1px solid transparent", background: "transparent", cursor: "pointer" }}>
                <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 26, height: 26, background: s.color, border: `1px solid ${s.border}` }}>
                  <svg width="13" height="13" fill="none" stroke={s.stroke} strokeWidth="1.8" viewBox="0 0 24 24">
                    {s.icon === "circle-info" && <><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>}
                    {s.icon === "book" && <><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>}
                    {s.icon === "clock" && <><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></>}
                    {s.icon === "home" && <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}
                    {s.icon === "chat" && <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>}
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e1ef", lineHeight: 1.3, marginBottom: 1 }}>{s.title}</div>
                  <div style={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.4 }}>{s.sub}</div>
                </div>
              </button>
            ))}
          </div>

          {/* User chip */}
          <div className="flex items-center gap-2 flex-shrink-0" style={{ padding: "11px 13px", borderTop: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}>
            <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 28, height: 28, background: "linear-gradient(135deg,#3b82f6,#a855f7)", fontSize: 10, fontWeight: 700, color: "#fff" }}>
              {userInitials}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e1ef" }}>{profile?.username ?? "you"}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{profile?.is_premium ? "Premium" : "Free"} · {FREE_TOKENS_PER_DAY} msgs/day</div>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1">
              <div style={{ fontSize: 10, color: "#64748b" }}>{tokensUsed}/{FREE_TOKENS_PER_DAY}</div>
              <div style={{ width: 42, height: 2, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#3b82f6,#2dd4bf)", width: `${tokenPct}%`, transition: "width 0.8s" }} />
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CHAT */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Topbar */}
          <div className="flex items-center justify-between flex-shrink-0" style={{ padding: "13px 22px", background: "rgba(5,4,14,0.6)", backdropFilter: "blur(40px)", borderBottom: "1px solid rgba(255,255,255,0.04)", animation: "topIn 0.7s cubic-bezier(0.22,1,0.36,1) both 0.1s" }}>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 36, height: 36, background: "linear-gradient(135deg,#1e40af,#3b82f6)", fontFamily: "'Instrument Serif', serif", fontSize: 16, color: "#fff", fontStyle: "italic", boxShadow: "0 0 16px rgba(59,130,246,0.4)" }}>
                E
                <span className="absolute rounded-full" style={{ bottom: 1, right: 1, width: 8, height: 8, background: "#4ade80", border: "2px solid #060511", animation: "statusPulse 2.5s ease infinite" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff" }}>Eva</div>
                <div style={{ fontSize: 10.5, color: "#4ade80", fontWeight: 600, letterSpacing: "0.02em" }}>● present with you</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/pricing" className="flex items-center gap-1 no-underline" style={{ padding: "5px 12px", borderRadius: 9999, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", fontSize: 11, fontWeight: 700, color: "#93c5fd", fontFamily: "'Syne', sans-serif" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#93c5fd"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                Go Premium
              </Link>
              <Link href="/circles" className="flex items-center justify-center rounded-lg no-underline" style={{ width: 32, height: 32, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#64748b" }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </Link>
              <button onClick={clearChat} className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#64748b", cursor: "pointer" }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto msgs-scroll flex flex-col gap-4" style={{ padding: "22px 22px 8px" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 msg-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" ? (
                  <div className="flex items-center justify-center rounded-full flex-shrink-0 mt-0.5" style={{ width: 30, height: 30, background: "linear-gradient(135deg,#1e40af,#3b82f6)", fontFamily: "'Instrument Serif', serif", fontSize: 12, color: "#fff", fontStyle: "italic", boxShadow: "0 0 10px rgba(59,130,246,0.25)" }}>E</div>
                ) : (
                  <div className="flex items-center justify-center rounded-full flex-shrink-0 mt-0.5" style={{ width: 30, height: 30, background: "linear-gradient(135deg,#4c1d95,#a855f7)", fontSize: 9.5, fontWeight: 700, color: "#fff" }}>{userInitials}</div>
                )}
                <div className="flex flex-col" style={{ maxWidth: "65%" }}>
                  <div style={{
                    padding: "12px 16px", fontSize: 13.5, lineHeight: 1.68, backdropFilter: "blur(20px)",
                    ...(msg.role === "assistant" ? {
                      background: "rgba(15,14,35,0.7)", border: "1px solid rgba(255,255,255,0.07)", borderBottomColor: "rgba(45,212,191,0.15)",
                      borderRadius: "3px 18px 18px 18px", color: "#cbd5e1", boxShadow: "0 4px 24px rgba(0,0,0,0.4)"
                    } : {
                      background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)", borderTopColor: "rgba(255,255,255,0.1)",
                      borderRadius: "18px 3px 18px 18px", color: "#fff", boxShadow: "0 4px 24px rgba(59,130,246,0.1)", alignSelf: "flex-end"
                    })
                  }}>
                    {msg.content.split("\n\n").map((para, j) => (
                      <p key={j} style={{ marginBottom: j < msg.content.split("\n\n").length - 1 ? 10 : 0 }}>{para}</p>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 3, padding: "0 3px", ...(msg.role === "user" ? { textAlign: "right" } : {}) }}>{msg.time}</div>

                  {/* Mood chips after first Eva message */}
                  {msg.role === "assistant" && i === 0 && showChips && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {["feeling anxious", "stressed out", "kinda low", "just here"].map((chip) => (
                        <button key={chip} onClick={() => {
                          setSelectedChip(chip);
                          const moodMap: Record<string, Mood> = { "feeling anxious": "anxious", "stressed out": "stressed", "kinda low": "low", "just here": "calm" };
                          setMood(moodMap[chip] ?? "neutral");
                          const text = chip === "just here" ? "just wanted to talk, nothing specific" : `feeling ${chip.replace("feeling ", "")} today`;
                          setInput(text);
                          textareaRef.current?.focus();
                        }} className="chip-item transition-all duration-300" style={{
                          padding: "5px 12px", borderRadius: 9999,
                          background: selectedChip === chip ? "rgba(59,130,246,0.25)" : "rgba(45,212,191,0.07)",
                          border: `1px solid ${selectedChip === chip ? "rgba(59,130,246,0.5)" : "rgba(45,212,191,0.18)"}`,
                          fontSize: 11.5, fontWeight: 600, color: selectedChip === chip ? "#fff" : "#a0ffee",
                          cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}>{chip}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="flex items-center justify-center rounded-full flex-shrink-0 mt-0.5" style={{ width: 30, height: 30, background: "linear-gradient(135deg,#1e40af,#3b82f6)", fontFamily: "'Instrument Serif', serif", fontSize: 12, color: "#fff", fontStyle: "italic" }}>E</div>
                <div className="flex items-center gap-1" style={{ padding: "12px 14px", background: "rgba(15,14,35,0.7)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "3px 18px 18px 18px" }}>
                  <span className="tdot1 rounded-full" style={{ width: 5, height: 5, background: "#2dd4bf", opacity: 0.5, display: "inline-block" }} />
                  <span className="tdot2 rounded-full" style={{ width: 5, height: 5, background: "#2dd4bf", opacity: 0.5, display: "inline-block" }} />
                  <span className="tdot3 rounded-full" style={{ width: 5, height: 5, background: "#2dd4bf", opacity: 0.5, display: "inline-block" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Memory bar */}
          <div className="flex items-center gap-1.5 flex-shrink-0 overflow-x-auto" style={{ padding: "7px 22px", background: "rgba(5,4,14,0.5)", borderTop: "1px solid rgba(255,255,255,0.03)", scrollbarWidth: "none" }}>
            <span style={{ fontSize: 9.5, color: "#64748b", whiteSpace: "nowrap", flexShrink: 0 }}>Memory:</span>
            {userCapsules.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center gap-1 flex-shrink-0" style={{ padding: "3px 10px", borderRadius: 9999, background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.18)", fontSize: 10, fontWeight: 600, color: "#d8b4fe", whiteSpace: "nowrap" }}>
                <span style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "#d8b4fe", display: "inline-block" }} />
                {c.slice(0, 20)}{c.length > 20 ? "…" : ""}
              </div>
            ))}
            <button onClick={saveMemoryCapsule} className="flex items-center gap-1 flex-shrink-0 transition-all" style={{ padding: "3px 10px", borderRadius: 9999, background: savedCapsule ? "rgba(45,212,191,0.15)" : "rgba(59,130,246,0.07)", border: `1px solid ${savedCapsule ? "rgba(45,212,191,0.35)" : "rgba(59,130,246,0.18)"}`, fontSize: 10, fontWeight: 600, color: savedCapsule ? "#a0ffee" : "#93c5fd", whiteSpace: "nowrap", cursor: "pointer" }}>
              {savedCapsule ? "✓ saved" : "+ save insight"}
            </button>
          </div>

          {/* Input zone */}
          <div className="flex-shrink-0" style={{ padding: "12px 16px 16px", background: "rgba(5,4,14,0.8)", backdropFilter: "blur(40px)", borderTop: "1px solid rgba(255,255,255,0.04)", animation: "botIn 0.7s cubic-bezier(0.22,1,0.36,1) both 0.25s" }}>
            <div className="flex items-end gap-2" style={{ background: "rgba(15,14,35,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderBottomColor: "rgba(45,212,191,0.15)", borderRadius: 20, padding: "10px 11px 10px 16px", boxShadow: "0 4px 30px rgba(0,0,0,0.3)" }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); handleInput(); }}
                onKeyDown={handleKeyDown}
                placeholder="tell eva what's on your mind..."
                rows={1}
                disabled={loading}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e2e1ef", fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.6, resize: "none", minHeight: 22, maxHeight: 120, caretColor: "#2dd4bf" }}
              />
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#64748b", cursor: "pointer" }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 9999, border: "none", cursor: "pointer", background: loading ? "linear-gradient(135deg,#1e40af,#a855f7)" : "#3b82f6", color: "#fff", boxShadow: loading ? undefined : "0 0 16px rgba(59,130,246,0.4)", animation: loading ? "sbSpin 1.5s ease infinite" : undefined, opacity: (!input.trim() && !loading) ? 0.4 : 1 }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/></svg>
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center" style={{ padding: "6px 2px 0" }}>
              <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>मौनं सर्वार्थसाधनम् · eva forgets when you close</span>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 10, color: "#64748b" }}>{tokensLeft} / {FREE_TOKENS_PER_DAY}</span>
                <div style={{ width: 64, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 2, background: tokenPct > 80 ? "linear-gradient(90deg,#f97316,#ef4444)" : "linear-gradient(90deg,#3b82f6,#2dd4bf)", width: `${tokenPct}%`, transition: "width 0.7s" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Modal */}
      {showCrisisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm mx-4" style={{ background: "rgba(9,8,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 48px rgba(0,0,0,0.6)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>hey, you don't have to go through this alone</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, lineHeight: 1.6 }}>there are real people trained to listen — no judgment, completely free and confidential.</p>
            <div className="flex flex-col gap-2 mb-5">
              <a href="https://icallhelpline.org/reyou/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between no-underline" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 14, padding: "12px 14px" }}>
                <div><p style={{ fontSize: 13, fontWeight: 600, color: "#93c5fd" }}>iCALL ReYou</p><p style={{ fontSize: 11, color: "#64748b" }}>chat-based · no phone call · free</p></div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#93c5fd" }}>open →</span>
              </a>
              <a href="tel:9999666555" className="flex items-center justify-between no-underline" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.18)", borderRadius: 14, padding: "12px 14px" }}>
                <div><p style={{ fontSize: 13, fontWeight: 600, color: "#d8b4fe" }}>Vandrevala Foundation</p><p style={{ fontSize: 11, color: "#64748b" }}>24/7 · free · confidential</p></div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#d8b4fe" }}>9999 666 555</span>
              </a>
            </div>
            <button onClick={() => setShowCrisisModal(false)} style={{ width: "100%", fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>continue conversation</button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm mx-4" style={{ background: "rgba(9,8,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 48px rgba(0,0,0,0.6)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>you've used your {FREE_TOKENS_PER_DAY} free reflections today</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20, lineHeight: 1.6 }}>resets at midnight. go premium for unlimited — ₹199/month.</p>
            <div className="flex flex-col gap-2">
              <Link href="/pricing" onClick={() => setShowUpgrade(false)} className="flex items-center justify-center no-underline" style={{ background: "#3b82f6", color: "#fff", borderRadius: 14, padding: "12px 0", fontSize: 13, fontWeight: 700 }}>see premium — ₹199/month</Link>
              <button onClick={() => setShowUpgrade(false)} style={{ fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>come back tomorrow</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}