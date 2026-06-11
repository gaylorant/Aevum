"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { hashPassword, hashPin } from "@/lib/auth/actions";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async () => {
    setError("");

    if (username.length < 3 || username.length > 20) {
      setError("Username must be 3–20 characters.");
      return;
    }
    if (password.length !== 8) {
      setError("Password must be exactly 8 characters.");
      return;
    }
    if (pin && pin.length !== 4) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Check username taken
    const { data: existing } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .single();

    if (existing) {
      setError("Username already taken.");
      setLoading(false);
      return;
    }

    const password_hash = await hashPassword(password);
    const pin_hash = pin ? await hashPin(pin) : null;

    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      username,
      password_hash,
      pin_hash,
    });

    if (insertError) {
      setError("Something went wrong. Try again.");
      setLoading(false);
      return;
    }

    router.push("/chat");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sameva-soft">
      <div className="w-full max-w-sm rounded-2xl border border-sameva-border bg-sameva-surface p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-sameva-ink">Set up your account</h1>
        <p className="mt-2 text-sm text-sameva-muted">This is a one-time setup. Choose carefully.</p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-sameva-muted">Username (3–20 chars)</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-sameva-border px-4 py-2 text-sm text-sameva-ink outline-none focus:border-sameva-accent"
              placeholder="yourname"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-sameva-muted">Password (exactly 8 characters)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-sameva-border px-4 py-2 text-sm text-sameva-ink outline-none focus:border-sameva-accent"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-sameva-muted">PIN (optional, 4 digits — for Memory Capsules)</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="mt-1 w-full rounded-xl border border-sameva-border px-4 py-2 text-sm text-sameva-ink outline-none focus:border-sameva-accent"
              placeholder="••••"
              maxLength={4}
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#6C63FF" }}
          >
            {loading ? "Setting up..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}