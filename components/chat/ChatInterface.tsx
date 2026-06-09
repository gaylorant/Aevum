"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  getLastUserMessage,
  getOrCreateSessionContext,
  loadChatHistory,
  saveChatHistory,
  wipeChatSession,
} from "@/lib/chat/storage";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/types/chat";

function echoAssistantReply(userInput: string): string {
  return `I hear you. You said: "${userInput}"`;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [capsuleStatus, setCapsuleStatus] = useState<string | null>(null);
  const [isSavingCapsule, setIsSavingCapsule] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const context = getOrCreateSessionContext();
    setSessionId(context.sessionId);
    setMessages(loadChatHistory());

    const handleBeforeUnload = () => {
      wipeChatSession();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }
    saveChatHistory(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const timestamp = new Date().toISOString();
    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
      timestamp,
    };
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: echoAssistantReply(trimmed),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setCapsuleStatus(null);
  }

  async function handleSaveCapsule() {
    const lastUserMessage = getLastUserMessage(messages);
    if (!lastUserMessage) {
      setCapsuleStatus("Send a message first before saving a Memory Capsule.");
      return;
    }

    if (!sessionId) {
      setCapsuleStatus("Session not ready. Please refresh and try again.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setCapsuleStatus(
        "Supabase is not configured. Add your project URL and anon key to .env.local.",
      );
      return;
    }

    setIsSavingCapsule(true);
    setCapsuleStatus(null);

    const { error } = await supabase.from("memory_capsules").insert({
      session_id: sessionId,
      insight: lastUserMessage.content,
      created_at: lastUserMessage.timestamp,
    });

    setIsSavingCapsule(false);

    if (error) {
      setCapsuleStatus(`Could not save capsule: ${error.message}`);
      return;
    }

    setCapsuleStatus("Memory Capsule saved — only this insight, never your full chat.");
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] flex-col">
      <div className="border-b border-aevum-border bg-aevum-surface px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-aevum-ink">Private Chat</h1>
        <p className="mt-1 max-w-2xl text-sm text-aevum-muted">
          Session-only conversation. Nothing is stored on our servers. All chat data
          is deleted when you close this tab.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
        <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-aevum-border bg-aevum-surface p-4 sm:p-6">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-aevum-muted">
              This is your private space. Share what&apos;s on your mind — it stays
              in this tab only.
            </p>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.timestamp}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-aevum-accent text-white"
                      : "bg-aevum-soft text-aevum-ink"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <textarea
  value={input}
  onChange={(event) => setInput(event.target.value)}
  onKeyDown={(event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }}
  placeholder="Type your message..."
  className="flex-1 rounded-xl border border-aevum-border bg-aevum-surface px-4 py-3 text-sm text-aevum-ink outline-none ring-aevum-accent focus:ring-2 resize-none min-h-[48px] max-h-[200px]"
  aria-label="Chat message"
  rows={1}
/>
          <button
            type="submit"
            className="rounded-xl bg-aevum-accent px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            disabled={!input.trim()}
          >
            Send
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleSaveCapsule}
            disabled={isSavingCapsule}
            className="rounded-xl border border-aevum-accent/30 bg-aevum-accent/10 px-4 py-2.5 text-sm font-medium text-aevum-accent transition-colors hover:bg-aevum-accent/20 disabled:opacity-50"
          >
            {isSavingCapsule ? "Saving..." : "Save Memory Capsule"}
          </button>
          {capsuleStatus ? (
            <p className="text-sm text-aevum-muted">{capsuleStatus}</p>
          ) : (
            <p className="text-xs text-aevum-muted">
              Saves only your last message as a key insight — never the full chat.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
