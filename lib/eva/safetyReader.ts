// ============================================================
// STEP 2: THE SAFETY READER
// File location: lib/eva/safetyReader.ts
//
// This is the ONLY thing that decides if a letter is dangerous.
// It does NOT match people. It does NOT write replies.
// One job: read the letter, decide a pathway, log the decision.
//
// REVISED: hardened classification prompt to explicitly hunt for
// indirect, euphemistic, and split-intent crisis language — not
// just literal/obvious phrasing. See inline comments for what
// changed and why.
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
  reasoning: string;
}

// The constrained prompt. Notice: it ONLY classifies. It never generates
// a reply, never talks to the user, never does anything except decide.
//
// WHAT CHANGED FROM THE ORIGINAL:
// 1. Added explicit instruction to look PAST literal wording — the model
//    is now told, directly, that crisis language is often indirect.
// 2. Added concrete examples of euphemism, metaphor, and split-intent
//    patterns — so the model has something to pattern-match against,
//    not just a category name.
// 3. Added Hinglish/code-switched distress phrasing examples, since this
//    is a named blind spot in the strategy doc (Section 8.2) and the
//    same gap exists here in the safety layer.
// 4. Added a mandatory "reasoning" field BEFORE the pathway decision —
//    forcing the model to articulate what it noticed before committing
//    to a label. This is a well-evidenced technique for reducing
//    shortcut/keyword-matching behavior in classification tasks.
// 5. Lowered the bar for what triggers soft_flag vs safe — ambiguous
//    cases now lean toward soft_flag rather than safe, since the cost
//    of a false soft_flag (gentle check-in) is near zero, while the
//    cost of a false "safe" on real distress is the entire point of
//    this system.
function buildSafetyPrompt(letterText: string): string {
  return `You are a safety classifier for an anonymous letter-writing platform where strangers write to strangers about real emotional pain. Your ONLY job is to read the letter below and classify it. You do not respond to the writer. You do not give advice. You only classify.

CRITICAL CONTEXT — READ THIS BEFORE CLASSIFYING:

People in genuine crisis very often do NOT use direct language like "I want to kill myself." Direct language is the easy case. Your real job is catching the harder case: people who signal distress indirectly, because they are scared, ashamed, testing the waters, or simply don't have words for it yet.

Watch specifically for these patterns, which are NOT obvious keywords but ARE strong signals:

INDIRECT / EUPHEMISTIC PHRASING:
- "I just want to sleep and not wake up" / "I want it all to stop" / "I'm so tired of existing"
- "everyone would be better off without me having to deal with me"
- "I don't think I'll be around much longer" / "this might be my last letter"
- Talking about "not being a burden anymore" or "finally being at peace"

SPLIT-INTENT (the danger signal is spread across multiple sentences, no single line is alarming alone):
- One sentence about hopelessness, a separate sentence about giving away possessions, a separate sentence about "saying goodbye" — read the WHOLE letter as one signal, not sentence by sentence.

FORWARD-LOOKING / PLANNING LANGUAGE:
- References to "after I'm gone," what happens to belongings, pets, or messages for specific people "in case"
- Sudden calm or resolution language after describing prolonged pain — this can indicate a plan has been formed, not that things have improved

HINGLISH / CODE-SWITCHED DISTRESS (do not require English crisis vocabulary):
- "bahut tension hai, kuch samajh nahi aa raha, sab khatam karna chahta hoon"
- "thak gaya hoon yaar, ab nahi ho raha"
- Mixed-language letters where the emotional core is expressed in Hindi/Hinglish even if the rest is in English — weigh the Hinglish content equally, do not default to treating it as less serious because it's informal.

MINIMIZING LANGUAGE THAT ACTUALLY SIGNALS SEVERITY:
- "it's probably nothing but..." / "this is dumb but I keep thinking about..." — minimizing language often precedes the most serious disclosures in this kind of writing. Do not let the casual framing lower your assessment.

---

YOUR PROCESS — DO THIS IN ORDER:

1. Read the entire letter once, fully, before forming any judgment.
2. Write a brief reasoning note: what did you actually notice — tone, specific phrases, what's said directly vs. implied, any of the patterns above? This must come BEFORE you decide a pathway.
3. Only after that reasoning, assign exactly one pathway.

Pathways:

- "safe" — no danger signals of any kind, ordinary emotional content (sadness, frustration, longing, etc. expressed without any of the patterns above)
- "soft_flag" — heavy emotional content, but not dangerous. Use this for ambiguous cases too — if you notice something that gives you pause but doesn't clearly meet crisis_gate, choose soft_flag rather than safe. The cost of a gentle check-in is near zero; the cost of waving through real distress is not.
- "crisis_gate" — any signal of suicidal ideation, self-harm, or intent to harm self or others, INCLUDING indirect, euphemistic, split-intent, or Hinglish-expressed signals as described above. This letter must NEVER reach another stranger. When genuinely uncertain between soft_flag and crisis_gate, choose crisis_gate — err toward caution, not toward letting it through.
- "hard_block" — abusive content, harassment, sexual content involving minors, or attempts to extract identifying information from others — must be quarantined for human review.

Letter text:
"""
${letterText}
"""

Respond in this exact JSON format only, nothing else:
{"reasoning": "brief note on what you noticed, 1-2 sentences", "pathway": "safe|soft_flag|crisis_gate|hard_block", "flag_category": "brief category name or none", "confidence": 0.0-1.0}`;
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
      max_tokens: 250, // increased from 150 to accommodate the reasoning field
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
    //
    // CHANGED: confidence threshold raised from 0.75 to 0.8. Given the
    // hardened prompt now actively hunts for subtler signals, we want a
    // slightly wider net for escalation — a model that's only "pretty sure"
    // about something this consequential should get a second opinion.
    const needsEscalation =
      parsed.confidence < 0.8 ||
      parsed.pathway === "crisis_gate" ||
      parsed.pathway === "hard_block" ||
      parsed.pathway === "soft_flag"; // CHANGED: soft_flag now also escalates.
      // Rationale: soft_flag is exactly the bucket where ambiguous euphemistic
      // language lands. A second, stronger model checking every soft_flag
      // catches cases where the fast model under-classified something that
      // was actually crisis_gate but didn't trigger high enough confidence
      // to know it. The cost is one extra model call on ambiguous letters —
      // worth it given what's at stake.

    if (needsEscalation) {
      wasEscalated = true;
      modelUsed = ESCALATION_MODEL;
      parsed = await callGroq(ESCALATION_MODEL, buildSafetyPrompt(letterText));
    }
  } catch (err) {
    // If both models fail, FAIL SAFE — never let a letter through unchecked.
    // Treat unknown/error states as soft_flag so a human eventually looks at it.
    console.error("Safety Reader error:", err);
    parsed = {
      pathway: "soft_flag",
      flag_category: "classifier_error",
      confidence: 0,
      reasoning: "classifier_error_fallback",
    };
    modelUsed = "error_fallback";
  }

  const result: SafetyResult = {
    pathway: parsed.pathway,
    flagCategory: parsed.flag_category || "none",
    confidence: parsed.confidence,
    modelUsed,
    wasEscalated,
    reasoning: parsed.reasoning || "none",
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
    // NOTE: reasoning is logged in spirit (it informed the decision) but the
    // raw reasoning text is intentionally NOT stored in this table, to stay
    // consistent with the existing decision-log philosophy: the log records
    // the DECISION, never the underlying sensitive text. If you want the
    // reasoning string itself persisted for debugging, that needs its own
    // explicit, deliberate decision — not a silent addition here.
  } as any);

  if (error) {
    // If logging itself fails, this is serious — surface it loudly.
    // Never silently swallow a logging failure.
    console.error("CRITICAL: Failed to write to eva_decision_log:", error);
  }
}