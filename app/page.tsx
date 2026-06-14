"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { samevaWords } from "@/lib/Sanskritwords";

const SanskritBackground = dynamic(() => import("@/components/sanskritbackground"), { ssr: false });
const InteractiveBlobs = dynamic(() => import("@/components/interactiveblob"), { ssr: false });

const marqueeItems = [...samevaWords, ...samevaWords, ...samevaWords];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060511] text-[#e2e1ef] relative font-sans" style={{overflowX: 'clip', overflowY: 'auto'}}>
      <SanskritBackground />
      <InteractiveBlobs />

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-16 h-[64px] md:h-[72px] bg-[#060511]/60 backdrop-blur-2xl border-b border-white/[0.06]">

        {/* Logo */}
        <div className="font-serif text-[22px] md:text-[28px] text-slate-400 hover:text-transparent hover:bg-gradient-to-r hover:from-teal-300 hover:via-blue-400 hover:to-purple-400 hover:bg-clip-text transition-all duration-500 cursor-default select-none">
          sameva
        </div>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-9 list-none">
          {["Chat", "Circles", "Lifebook", "Pricing"].map(item => (
            <li key={item}>
              <Link
                href={`/${item.toLowerCase()}`}
                className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/50 hover:text-[#b8c3ff] transition-colors duration-200"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>

        {/* Buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Sign In — hidden on mobile */}
          <Link
            href="/login"
            className="inline-flex text-[13px] font-[800] font-sans px-[22px] py-[10px] rounded-full bg-transparent text-[#cbbeff] border border-[rgba(203,190,255,0.22)] backdrop-blur-md hover:border-[rgba(203,190,255,0.45)] hover:bg-[rgba(203,190,255,0.06)] transition-all duration-200"
          >
            Sign In
          </Link>
          {/* Get Started — always visible */}
          <Link
            href="/login"
            className="text-[12px] md:text-[13px] font-[800] font-sans px-[16px] md:px-[24px] py-[8px] md:py-[10px] rounded-full text-[#efefff] transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: "#2E5BFF", boxShadow: "0 0 32px -6px #2E5BFF" }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-[64px] md:pt-[72px]">

        {/* ── Hero ── */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-5 md:px-6">
          <div className="inline-flex items-center gap-2 text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.1em] text-[#b8c3ff] bg-[rgba(184,195,255,0.07)] border border-[rgba(184,195,255,0.14)] px-[14px] md:px-[18px] py-[6px] rounded-full mb-7 md:mb-9">
            <span className="w-[6px] h-[6px] rounded-full bg-[#00FFFF] animate-pulse" style={{ boxShadow: "0 0 8px #00FFFF" }} />
            AI Wellbeing · Privacy First · India
          </div>

          <h1 className="font-serif text-[clamp(38px,9vw,96px)] font-normal leading-[1.07] tracking-[-0.02em] text-white max-w-[920px] mb-6 md:mb-7">
            Your growth<br />belongs to{" "}
            <em className="italic text-[#b8c3ff]" style={{ textShadow: "0 0 40px rgba(184,195,255,0.4)" }}>
              you
            </em>.
          </h1>

          <p className="text-[15px] md:text-[18px] leading-[1.75] text-white/60 max-w-[540px] mb-10 md:mb-12 px-2">
            Meet Eva — she listens without judgment, remembers what matters,{" "}
            and forgets everything the moment you close the tab.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center justify-center w-full max-w-[300px] sm:max-w-none">
            <Link
              href="/chat"
              className="w-full sm:w-auto text-center text-[14px] md:text-[15px] font-[800] font-sans px-8 md:px-9 py-[13px] md:py-[14px] rounded-full text-[#efefff] transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: "#2E5BFF", boxShadow: "0 0 44px -8px #2E5BFF" }}
            >
              Start a Reflection
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto text-center text-[14px] md:text-[15px] font-[800] font-sans px-8 md:px-9 py-[13px] md:py-[14px] rounded-full bg-transparent text-[#cbbeff] border border-[rgba(203,190,255,0.22)] backdrop-blur-md hover:border-[rgba(203,190,255,0.45)] hover:bg-[rgba(203,190,255,0.06)] transition-all duration-200"
            >
              View pricing
            </Link>
          </div>
        </section>

        {/* ── Sanskrit marquee ── */}
        <div className="relative py-10 md:py-12 border-t border-b border-white/[0.04] overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-12 md:w-20 bg-gradient-to-r from-[#060511] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 md:w-20 bg-gradient-to-l from-[#060511] to-transparent z-10 pointer-events-none" />
          <div
            className="flex gap-12 md:gap-16 whitespace-nowrap"
            style={{ animation: "marquee 55s linear infinite", width: "max-content" }}
          >
            {marqueeItems.map((item, idx) => (
              <div key={idx} className="inline-flex flex-col items-center gap-1 flex-shrink-0">
                <span className="font-serif text-[14px] md:text-[16px] text-[rgba(184,195,255,0.6)] tracking-wide">
                  {item.sanskrit}
                </span>
                <span className="text-[8px] md:text-[9px] font-semibold uppercase tracking-[0.12em] text-[rgba(184,195,255,0.22)]">
                  {item.phonetic} · {item.meaning}
                </span>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes marquee {
              from { transform: translateX(0); }
              to   { transform: translateX(-33.333%); }
            }
          `}</style>
        </div>

        {/* ── Feature cards ── */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-16 py-16 md:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(184,195,255,0.4)] text-center mb-4">
            What Sameva offers
          </p>
          <h2 className="font-serif text-[clamp(28px,4vw,52px)] font-normal text-center text-white mb-12 md:mb-[72px] leading-[1.15]">
            Built for the moments<br />you need it most, <em className="italic text-[#b8c3ff]">right now</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                icon: "💬",
                shloka: "मौनं सर्वार्थसाधनम् — Silence accomplishes all",
                title: "Private Chat",
                desc: "Eva listens first, talks less. No data stored, no one reading. Close the tab and she forgets everything — that's the feature, not a limitation.",
                href: "/chat",
                color: "rgba(46,91,255,0.3)",
                shadow: "rgba(46,91,255,0.22)",
                iconBg: "rgba(46,91,255,0.1)",
                iconBorder: "rgba(46,91,255,0.2)",
                iconColor: "#87CEFA",
              },
              {
                icon: "⭕",
                shloka: "सर्वे भवन्तु सुखिनः — May all beings be happy",
                title: "Peer Circles",
                desc: "Anonymous 5-person rooms. Real people, similar situations, no real names. WebRTC peer-to-peer — nothing passes through a server. Ever.",
                href: "/circles",
                color: "rgba(0,206,209,0.25)",
                shadow: "rgba(0,206,209,0.18)",
                iconBg: "rgba(0,206,209,0.1)",
                iconBorder: "rgba(0,206,209,0.2)",
                iconColor: "#A0FFEE",
              },
              {
                icon: "📖",
                shloka: "स्वाध्यायान्मा प्रमदः — Never neglect self-study",
                title: "Lifebook",
                desc: "Habit tracker, study planner, focus timer, journal. All local. Your data never leaves your device unless you choose to sync it.",
                href: "/lifebook",
                color: "rgba(138,43,226,0.3)",
                shadow: "rgba(138,43,226,0.22)",
                iconBg: "rgba(138,43,226,0.1)",
                iconBorder: "rgba(138,43,226,0.2)",
                iconColor: "#DDA0DD",
              },
            ].map(card => (
              <Link
                key={card.title}
                href={card.href}
                className="group relative rounded-2xl md:rounded-3xl border border-white/[0.06] bg-white/[0.022] backdrop-blur-2xl p-7 md:p-10 flex flex-col transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                style={{
                  borderBottomColor: "rgba(203,190,255,0.1)",
                  borderRightColor: "rgba(203,190,255,0.1)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = card.color;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 28px 56px -14px ${card.shadow}`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
                <div
                  className="w-[44px] h-[44px] md:w-[52px] md:h-[52px] rounded-full flex items-center justify-center text-[18px] md:text-[22px] border mb-5 md:mb-7 transition-all duration-300 group-hover:scale-110"
                  style={{ background: card.iconBg, borderColor: card.iconBorder, color: card.iconColor }}
                >
                  {card.icon}
                </div>
                <p className="font-serif text-[11px] text-[rgba(184,195,255,0.22)] mb-3 md:mb-4 leading-relaxed">
                  {card.shloka}
                </p>
                <h3 className="font-sans text-[18px] md:text-[21px] font-[700] text-white mb-2 md:mb-3 tracking-[-0.01em]">
                  {card.title}
                </h3>
                <p className="text-[14px] md:text-[15px] leading-[1.75] text-[rgba(196,197,217,0.75)] group-hover:text-[rgba(226,225,239,0.88)] transition-colors duration-300">
                  {card.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Privacy Promise ── */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-16 pb-16 md:pb-24">
          <div className="relative rounded-[20px] md:rounded-[28px] border border-white/[0.06] bg-white/[0.015] backdrop-blur-xl p-6 md:p-12 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(184,195,255,0.2)] to-transparent" />
            <h3 className="font-serif text-[22px] md:text-[28px] text-white mb-1">Our privacy promise</h3>
            <p className="font-serif text-[12px] md:text-[13px] text-[rgba(184,195,255,0.25)] mb-6 md:mb-8 tracking-wide">
              सत्यं वद — speak only truth
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              {[
                ["#00CED1", "No chat history stored on any server, ever"],
                ["#b8c3ff", "No accounts required on the free tier"],
                ["#8A2BE2", "No third-party analytics or tracking scripts"],
                ["#2E5BFF", "No advertising, no behavioral profiling, no data selling"],
                ["#00CED1", "Crisis support stays private — they don't call your parents"],
                ["#b8c3ff", "Session ends when you close the tab — we forget you, by design"],
              ].map(([color, text], i) => (
                <div key={i} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-[12px] md:rounded-[14px] hover:bg-white/[0.025] transition-colors duration-200">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-[6px]"
                    style={{ background: color as string, boxShadow: `0 0 10px ${color}80` }}
                  />
                  <span className="text-[13px] md:text-[14px] text-[rgba(196,197,217,0.75)] leading-[1.6]">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <div className="max-w-[860px] mx-auto px-4 md:px-6 mb-20 md:mb-28">
          <div className="relative rounded-[24px] md:rounded-[36px] border border-white/[0.055] bg-white/[0.018] backdrop-blur-2xl px-6 py-14 md:p-[72px] text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-[rgba(184,195,255,0.25)] to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(46,91,255,0.1),transparent_65%)] pointer-events-none" />
            <p className="font-serif text-[12px] md:text-[14px] text-[rgba(184,195,255,0.3)] mb-4 tracking-wide relative z-10">
              असतो मा सद्गमय — Lead me from the unreal to the real
            </p>
            <h2 className="font-sans text-[clamp(24px,4vw,42px)] font-[800] text-white mb-4 relative z-10">
              Begin your journey
            </h2>
            <p className="text-[15px] md:text-[17px] text-[rgba(196,197,217,0.65)] max-w-[460px] mx-auto mb-8 md:mb-10 leading-[1.7] relative z-10">
              Discover what clarity feels like when someone is actually listening. Your private space is ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center relative z-10 max-w-[300px] sm:max-w-none mx-auto">
              <Link
                href="/chat"
                className="w-full sm:w-auto text-center text-[14px] md:text-[15px] font-[800] px-8 md:px-9 py-[13px] md:py-[14px] rounded-full text-[#efefff] transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: "#2E5BFF", boxShadow: "0 0 44px -8px #2E5BFF" }}
              >
                Start for free
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto text-center text-[14px] md:text-[15px] font-[800] px-8 md:px-9 py-[13px] md:py-[14px] rounded-full bg-transparent text-[#cbbeff] border border-[rgba(203,190,255,0.22)] backdrop-blur-md hover:border-[rgba(203,190,255,0.45)] hover:bg-[rgba(203,190,255,0.06)] transition-all duration-200"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.04] px-4 md:px-16 py-8 md:py-10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-5 relative z-10 text-center md:text-left">
        <div className="font-serif text-[20px] md:text-[24px] text-white/25">sameva</div>
        <ul className="flex gap-5 md:gap-7 list-none">
          {["Privacy", "Terms", "Help"].map(l => (
            <li key={l}>
              <Link href="#" className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/28 hover:text-[rgba(184,195,255,0.6)] transition-colors duration-200">
                {l}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-[11px] italic text-white/20">© 2026 Sameva. We forget you when you close the tab.</p>
      </footer>

    </div>
  );
}