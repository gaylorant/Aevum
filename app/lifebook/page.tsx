"use client";

import Link from "next/link";

const tools = [
  {
    icon: "🔥",
    name: "Habit Tracker",
    description: "Track daily habits locally. Export as CSV or JSON anytime.",
    color: "rgba(46,91,255,0.3)",
    iconBg: "rgba(46,91,255,0.1)",
    iconBorder: "rgba(46,91,255,0.2)",
    iconColor: "#87CEFA",
    soon: false,
  },
  {
    icon: "📅",
    name: "Study Planner",
    description: "Plan sessions and goals on your device only.",
    color: "rgba(0,206,209,0.25)",
    iconBg: "rgba(0,206,209,0.1)",
    iconBorder: "rgba(0,206,209,0.2)",
    iconColor: "#A0FFEE",
    soon: false,
  },
  {
    icon: "⏱️",
    name: "Focus Timer",
    description: "Pomodoro-style focus sessions with no cloud sync.",
    color: "rgba(138,43,226,0.3)",
    iconBg: "rgba(138,43,226,0.1)",
    iconBorder: "rgba(138,43,226,0.2)",
    iconColor: "#DDA0DD",
    soon: false,
  },
  {
    icon: "📖",
    name: "Journal",
    description: "Private reflections stored in your browser. No one reads this but you.",
    color: "rgba(184,195,255,0.3)",
    iconBg: "rgba(184,195,255,0.08)",
    iconBorder: "rgba(184,195,255,0.15)",
    iconColor: "#cbbeff",
    soon: false,
  },
];

export default function LifebookPage() {
  return (
    <div className="min-h-screen bg-[#060511] text-[#e2e1ef] relative overflow-x-hidden font-sans">

      {/* Ambient background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-[rgba(46,91,255,0.12)] blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[420px] h-[420px] rounded-full bg-[rgba(138,43,226,0.1)] blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] rounded-full bg-[rgba(0,206,209,0.08)] blur-[110px]" />
      </div>

      <main className="relative z-10 max-w-[1100px] mx-auto px-8 pt-28 pb-24">

        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#b8c3ff] bg-[rgba(184,195,255,0.07)] border border-[rgba(184,195,255,0.14)] px-[18px] py-[6px] rounded-full mb-7">
            <span className="w-[6px] h-[6px] rounded-full bg-[#8a2be2]" style={{ boxShadow: "0 0 8px #8a2be2" }} />
            Local-only · Zero cloud · Yours forever
          </div>
          <h1 className="font-serif text-[clamp(40px,6vw,72px)] font-normal leading-[1.07] tracking-[-0.02em] text-white mb-5">
            Your <em className="italic text-[#cbbeff]">Lifebook</em>
          </h1>
          <p className="text-[17px] leading-[1.75] text-white/50 max-w-[480px] mx-auto">
            Personal tools that live on your device. Nothing syncs to a server unless you ask it to.
          </p>
          <p className="font-serif text-[12px] text-[rgba(184,195,255,0.25)] mt-3 tracking-wide">
            स्वाध्यायान्मा प्रमदः — Never neglect self-study
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="group relative rounded-3xl border border-white/[0.06] bg-white/[0.022] backdrop-blur-2xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer"
              style={{
                borderBottomColor: "rgba(203,190,255,0.08)",
                borderRightColor: "rgba(203,190,255,0.08)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = tool.color;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 28px 56px -14px ${tool.color}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />

              {/* Coming soon badge */}
              {tool.soon && (
                <div className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-[0.08em] px-3 py-1 rounded-full bg-[rgba(184,195,255,0.08)] border border-[rgba(184,195,255,0.15)] text-[#cbbeff]">
                  Soon
                </div>
              )}

              <div
                className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-[20px] border mb-6 transition-all duration-300 group-hover:scale-110"
                style={{ background: tool.iconBg, borderColor: tool.iconBorder, color: tool.iconColor }}
              >
                {tool.icon}
              </div>

              <h2 className="font-sans text-[19px] font-[700] text-white mb-3 tracking-[-0.01em]">
                {tool.name}
              </h2>
              <p className="text-[14px] leading-[1.75] text-[rgba(196,197,217,0.7)] group-hover:text-[rgba(226,225,239,0.85)] transition-colors duration-300">
                {tool.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[rgba(184,195,255,0.4)] group-hover:text-[rgba(184,195,255,0.8)] transition-colors duration-300">
                Open
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="transition-transform duration-200 group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <div className="relative rounded-[24px] border border-dashed border-[rgba(184,195,255,0.12)] bg-[rgba(184,195,255,0.03)] p-10 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-[rgba(184,195,255,0.2)] to-transparent" />
          <div className="text-[28px] mb-4">🌱</div>
          <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#cbbeff] mb-3">Coming next</p>
          <p className="text-[14px] text-white/40 max-w-[420px] mx-auto leading-[1.7]">
            Full tool UIs with localStorage persistence, streak tracking, and export features are being built right now.
          </p>
        </div>

      </main>
    </div>
  );
}