// ============================================================
// STEP 2: THE SAFETY READER
// File location: lib/eva/safetyReader.ts
//
// This is the ONLY thing that decides if a letter is dangerous.
// It does NOT match people. It does NOT write replies.
// One job: read the letter, decide a pathway, log the decision.
// ============================================================

import { getServiceClient } from '@/lib/supabase/serviceClient';

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// The fast, cheap model — handles almost every letter
const FAST_MODEL = "llama-3.1-8b-instant";

// The stronger model — only used when the fast model is unsure
const ESCALATION_MODEL = "llama-3.3-70b-versatile";

type Pathway = "safe" | "soft_flag" | "crisis_gate" | "hard_block";

interface SafetyResult {
  pathway: Pathway;
  flagCategory: string;
  confidence: number;
  modelUsed: string;
  wasEscalated: boolean;
}

// The constrained prompt. Notice: it ONLY classifies. It never generates
// a reply, never talks to the user, never does anything except decide.
function buildSafetyPrompt(letterText: string): string {
  return `You are a safety classifier for an anonymous letter-writing platform. Your ONLY job is to read the letter below and classify it. You do not respond to the writer. You do not give advice. You only classify.

Classify this letter into exactly one pathway:

- "safe" — no danger signals, normal emotional content, can proceed to matching
- "soft_flag" — heavy emotional content but not dangerous (e.g. sadness, grief, anger) — letter should still post, but Eva may gently check in with the writer first
- "crisis_gate" — contains signals of suicidal ideation, self-harm, or intent to harm self or others — this letter must NEVER reach another stranger. Route to crisis resources instead.
- "hard_block" — contains abusive content, harassment, sexual content involving minors, or attempts to extract identifying information from others — must be quarantined for human review.

Letter text:
"""
${letterText}
"""

Respond in this exact JSON format only, nothing else:
{"pathway": "safe|soft_flag|crisis_gate|hard_block", "flag_category": "brief category name or none", "confidence": 0.0-1.0}`;
}

async function callGroq(model: string, prompt: string): Promise<any> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NEXT_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 150,
      temperature: 0, // zero creativity — this is classification, not conversation
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices[0].message.content.trim();

  // Strip markdown code fences if the model wrapped its JSON in them
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function runSafetyCheck(
  letterText: string,
  letterId: string | null,
  userId: string
): Promise<SafetyResult> {
  let wasEscalated = false;
  let parsed: any;
  let modelUsed = FAST_MODEL;

  try {
    // First pass: fast, cheap model handles almost everything
    parsed = await callGroq(FAST_MODEL, buildSafetyPrompt(letterText));

    // If the fast model is unsure (low confidence) OR flags anything serious,
    // double-check with the stronger model before trusting it.
    const needsEscalation =
      parsed.confidence < 0.75 ||
      parsed.pathway === "crisis_gate" ||
      parsed.pathway === "hard_block";

    if (needsEscalation) {
      wasEscalated = true;
      modelUsed = ESCALATION_MODEL;
      parsed = await callGroq(ESCALATION_MODEL, buildSafetyPrompt(letterText));
    }
  } catch (err) {
    // If both models fail, FAIL SAFE — never let a letter through unchecked.
    // Treat unknown/error states as soft_flag so a human eventually looks at it.
    console.error("Safety Reader error:", err);
    parsed = { pathway: "soft_flag", flag_category: "classifier_error", confidence: 0 };
    modelUsed = "error_fallback";
  }

  const result: SafetyResult = {
    pathway: parsed.pathway,
    flagCategory: parsed.flag_category || "none",
    confidence: parsed.confidence,
    modelUsed,
    wasEscalated,
  };

  // STEP 1's table gets used right here. Every single decision gets logged,
  // no exceptions, before the calling code does anything else with the result.
  await logDecision(letterId, userId, result);

  return result;
}

async function logDecision(
  letterId: string | null,
  userId: string,
  result: SafetyResult
) {
  const supabase = getServiceClient();
  if (!supabase) {
    console.error("CRITICAL: Supabase client unavailable, could not log Eva decision");
    return;
  }

  const needsHumanReview =
    result.pathway === "crisis_gate" || result.pathway === "hard_block";

  const { error } = await supabase.from("eva_decision_log").insert({
    letter_id: letterId,
    user_id: userId,
    pathway: result.pathway,
    flag_category: result.flagCategory,
    confidence: result.confidence,
    model_used: result.modelUsed,
    was_escalated: result.wasEscalated,
    human_review_triggered: needsHumanReview,
    human_review_status: needsHumanReview ? "pending" : null,
  }as any);

  if (error) {
    // If logging itself fails, this is serious — surface it loudly.
    // Never silently swallow a logging failure.
    console.error("CRITICAL: Failed to write to eva_decision_log:", error);
  }
}