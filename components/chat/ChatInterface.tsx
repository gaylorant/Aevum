"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
interface Message {
  role: "user" | "assistant";
  content: string;
}

const CRISIS_KEYWORDS = [
  "kill myself", "killing myself",
  "suicide", "suicidal",
  "want to die", "don't want to exist",
  "end it all", "end my life",
  "jump off", "jump from",
  "not worth living",
];

function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

const FREE_TOKENS_PER_DAY = 3;

function getTodayKey() {
  return `aevum_tokens_${new Date().toISOString().slice(0, 10)}`;
}

function getTokensUsedToday(): number {
  try {
    return parseInt(localStorage.getItem(getTodayKey()) ?? "0", 10);
  } catch {
    return 0;
  }
}

function incrementTokensUsed() {
  try {
    const key = getTodayKey();
    const used = getTokensUsedToday();
    localStorage.setItem(key, String(used + 1));
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("aevum_tokens_") && k !== key) {
        localStorage.removeItem(k);
      }
    }
  } catch {}
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedCapsule, setSavedCapsule] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const exchangeCount = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTokensUsed(getTokensUsedToday());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const handleUnload = () => setMessages([]);
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const used = getTokensUsedToday();
    if (used >= FREE_TOKENS_PER_DAY) {
      setShowUpgradePrompt(true);
      return;
    }

    if (detectCrisis(text)) setShowCrisisModal(true);

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    incrementTokensUsed();
    setTokensUsed(used + 1);
    exchangeCount.current += 1;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const reply = data.reply ?? "I couldn't respond right now. Try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong on my end. Your words are still here — try sending again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const saveMemoryCapsule = async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) return;
    try {
        await getSupabaseClient()?.from("memory_capsules").insert({
        content: lastUserMessage.content,
        created_at: new Date().toISOString(),
      });
      setSavedCapsule(true);
      setTimeout(() => setSavedCapsule(false), 4000);
    } catch {
      console.error("Failed to save capsule");
    }
  };

  const tokensLeft = Math.max(0, FREE_TOKENS_PER_DAY - tokensUsed);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 py-6">

      {showCrisisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              You're not alone in this
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              If you're having thoughts of harming yourself, please reach out to someone trained to help.
            </p>
            <div className="space-y-2 mb-5">
              <a href="tel:14416" className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100 transition">
                <span>Kiran Mental Health Helpline</span>
                <span className="font-bold">14416</span>
              </a>
              <a href="tel:9999666555" className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm font-medium text-orange-700 hover:bg-orange-100 transition">
                <span>Vandrevala Foundation</span>
                <span className="font-bold">9999 666 555</span>
              </a>
              <a href="tel:112" className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 transition">
                <span>Emergency Services</span>
                <span className="font-bold">112</span>
              </a>
            </div>
            <button onClick={() => setShowCrisisModal(false)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition">
              Continue conversation
            </button>
          </div>
        </div>
      )}

      {showUpgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              You've used your 3 free reflections today
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Free tokens reset at midnight. Or upgrade to Premium for 10 reflections per day — ₹199/month.
            </p>
            <div className="space-y-2">
              <button onClick={() => setShowUpgradePrompt(false)} className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-700 transition">
                See Premium — ₹199/month
              </button>
              <button onClick={() => setShowUpgradePrompt(false)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition">
                Come back tomorrow
              </button>
            </div>
          </div>
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 pb-8">
          <p className="text-2xl font-semibold text-gray-800">What's on your mind?</p>
          <p className="text-sm text-gray-400 max-w-xs">
            This space is private. Nothing you say here is stored. It disappears when you close this tab.
          </p>
          <p className="text-xs text-gray-300 mt-2">{tokensLeft} reflection{tokensLeft !== 1 ? "s" : ""} left today</p>
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-gray-900 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                  </div>
          </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {messages.some((m) => m.role === "user") && (
        <div className="mb-2 flex items-center gap-3">
          <button onClick={saveMemoryCapsule} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition">
            Save as Memory Capsule
          </button>
          {savedCapsule && (
            <span className="text-xs text-green-500">
              Saved — only this insight, never your full chat
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type here… (Enter to send, Shift+Enter for new line)"
          rows={3}
          disabled={loading}
          className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-16 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="absolute right-3 bottom-3 bg-gray-900 text-white rounded-xl px-3 py-1.5 text-xs font-medium hover:bg-gray-700 disabled:opacity-30 transition"
        >
          Send
        </button>
      </div>

      <p className="text-center text-xs text-gray-300 mt-2">
        {tokensLeft} reflection{tokensLeft !== 1 ? "s" : ""} left today · resets at midnight
      </p>
    </div>
  );
}