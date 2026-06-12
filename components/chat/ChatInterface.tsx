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
  "want to disappear forever",
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

// Get current time info from browser
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

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = days[now.getDay()];

  return `Current time: ${timeStr} IST (${timeOfDay}, ${dayName})`;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedCapsule, setSavedCapsule] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [crisisMessageCount, setCrisisMessageCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTokensUsed(getTokensUsedToday());

    // Send opening message from Aevum on load
    const openingMessage: Message = {
      role: "assistant",
      content: "Yo, i'm Eva 👋\n\nthis is your space — nothing you say here gets stored, no one's reading this, and the moment you close this tab i forget everything. that's kind of the whole point.\n\ntwo things that might be useful: if something clicks mid-convo and you don't want to lose it, you can save it as a Memory Capsule — just that one thought, not the whole chat.\n\nand if you ever want to talk to actual people going through similar stuff, Peer Circles has anonymous 5-person voice/video rooms. no real names, no pressure, just real humans.\n\nanyway. what's going on?",
    };
    setMessages([openingMessage]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const supabase = getSupabaseClient();
      supabase?.auth.getSession().then(async ({ data }) => {
        if (data.session) {
          const { data: profile } = await supabase
            .from("users")
            .select("username")
            .eq("id", data.session.user.id)
            .single();
          
          if (!profile) {
            window.location.href = "/onboarding";
          } else {
            window.location.hash = "";
          }
        }
      });
    }
  }, []);

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

    if (detectCrisis(text)) {
      setCrisisMessageCount(prev => prev + 1);
    }    

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    incrementTokensUsed();
    setTokensUsed(used + 1);

    const requestBody = JSON.stringify({
      messages: updatedMessages,
      timeContext: getCurrentTimeContext(),
    });

    try {
      let res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      if (!res.ok) {
        await new Promise(r => setTimeout(r, 2000));
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        });
      }

      if (!res.ok) {
        await new Promise(r => setTimeout(r, 3000));
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        });
      }

      if (!res.ok) throw new Error("API error");

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const reply = data.reply ?? "lost my train of thought, say that again?";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "lost my train of thought, say that again?",
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
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase?.auth.getSession() ?? { data: { session: null } };
      await supabase?.from("memory_capsules").insert({
        content: lastUserMessage.content,
        created_at: new Date().toISOString(),
        user_id: session?.user?.id ?? null,
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

      {/* Crisis Modal */}
      {showCrisisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              hey, you don't have to go through this alone
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              there are real people trained to listen — no judgment, completely free and confidential.
            </p>
            <div className="space-y-2 mb-5">
              <a
                href="https://icallhelpline.org/reyou/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                <div>
                  <p className="font-semibold">iCALL ReYou</p>
                  <p className="text-xs font-normal text-blue-500">chat-based · no phone call needed · free</p>
                </div>
                <span className="font-bold text-xs">open chat →</span>
              </a>
              <a
                href="tel:9999666555"
                className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm font-medium text-purple-700 hover:bg-purple-100 transition"
              >
                <div>
                  <p className="font-semibold">Vandrevala Foundation</p>
                  <p className="text-xs font-normal text-purple-500">24/7 · free · confidential</p>
                </div>
                <span className="font-bold">9999 666 555</span>
              </a>
              <a
                href="tel:112"
                className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100 transition"
              >
                <div>
                  <p className="font-semibold">Emergency</p>
                  <p className="text-xs font-normal text-red-500">if you're in immediate danger</p>
                </div>
                <span className="font-bold">112</span>
              </a>
            </div>
            <button
              onClick={() => setShowCrisisModal(false)}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition"
            >
              continue conversation
            </button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              you've used your 50 free reflections today
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              resets at midnight. or go premium for unlimited — ₹199/month.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-700 transition"
              >
                see premium — ₹199/month
              </button>
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition"
              >
                come back tomorrow
              </button>
            </div>
          </div>
        </div>
      )}

      

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gray-900 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}>
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

      {/* Memory Capsule */}
      {messages.some((m) => m.role === "user") && (
        <div className="mb-2 flex items-center gap-3">
          <button
            onClick={saveMemoryCapsule}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition"
          >
            save as memory capsule
          </button>
          {savedCapsule && (
            <span className="text-xs text-green-500">
              saved — only this insight, never your full chat
            </span>
          )}
        </div>
      )}

      {/* Input */}
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