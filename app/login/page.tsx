"use client";

import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/confirm`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sameva-soft">
      <div className="w-full max-w-sm rounded-2xl border border-sameva-border bg-sameva-surface p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-sameva-ink">Welcome to Sameva</h1>
        <p className="mt-2 text-sm text-sameva-muted">
          Sign in to save your Memory Capsules and access premium features.
        </p>
        <button
          onClick={handleGoogleLogin}
          className="mt-6 w-full rounded-xl border border-sameva-border bg-white py-3 text-sm font-medium text-sameva-ink transition-colors hover:bg-sameva-soft"
        >
          Continue with Google
        </button>
        <p className="mt-4 text-center text-xs text-sameva-muted">
          No email stored. No tracking. Your privacy is the product.
        </p>
      </div>
    </div>
  );
}