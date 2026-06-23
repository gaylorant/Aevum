// ============================================================
// SERVER-ONLY SUPABASE CLIENT
// File location: lib/supabase/serviceClient.ts
//
// This client uses the SERVICE ROLE key, which bypasses Row
// Level Security entirely. It must NEVER be imported into any
// file that runs in the browser — only in server-side code like
// API routes or files like safetyReader.ts.
//
// Use this ONLY for trusted backend writes (like Eva's decision
// log). Never use this for anything a user directly triggers
// without your own validation in between.
// ============================================================

import { createClient } from '@supabase/supabase-js';

let serviceClient: ReturnType<typeof createClient> | null = null;

export function getServiceClient() {
  if (serviceClient) return serviceClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("CRITICAL: Missing Supabase service role configuration");
    return null;
  }

  serviceClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceClient;
}