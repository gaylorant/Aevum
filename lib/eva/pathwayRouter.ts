// ============================================================
// STEP 3: THE PATHWAY ROUTER
// File location: lib/eva/pathwayRouter.ts
//
// This is the layer that takes the Safety Reader's classification
// and actually DOES something with it. The Safety Reader only
// decides. This file acts on that decision.
//
// Call this AFTER runSafetyCheck() returns a result.
// ============================================================

import { runSafetyCheck } from './safetyReader';
import { getServiceClient } from '@/lib/supabase/serviceClient';

interface PathwayOutcome {
  // Should the letter actually be allowed to post / save right now?
  canProceed: boolean;

  // What should the UI show the user immediately?
  uiAction: 'post_normally' | 'show_soft_checkin' | 'open_crisis_chat' | 'show_under_review';

  // A message Eva can show, where relevant (kept short, gentle, never clinical)
  evaMessage: string | null;
}

const CRISIS_HELPLINES = {
  primary: {
    name: "iCALL ReYou",
    type: "chat-based",
    url: "https://icallhelpline.org/reyou",
  },
  secondary: {
    name: "Vandrevala Foundation",
    type: "call-based, 24/7",
    phone: "9999 666 555",
  },
};

export async function routeLetterThroughSafety(
  letterText: string,
  letterId: string | null,
  userId: string | null
): Promise<PathwayOutcome> {
  const safetyResult = await runSafetyCheck(letterText, letterId, userId as any);

  switch (safetyResult.pathway) {
    case "safe":
      // Nothing more to do. Letter proceeds straight through.
      return {
        canProceed: true,
        uiAction: "post_normally",
        evaMessage: null,
      };

    case "soft_flag":
      // Letter CAN still proceed, but Eva gently checks in first.
      // The UI should show this message and let the user confirm
      // before the letter actually posts.
      return {
        canProceed: true,
        uiAction: "show_soft_checkin",
        evaMessage: "that's a lot to put into words. want to go ahead and send this, or sit with it a little longer first?",
      };

    case "crisis_gate":
      // Letter must NEVER reach a stranger. Block it from posting
      // entirely, and instead open Eva's private crisis chat.
      await flagForHumanAwareness(letterId, userId, safetyResult.flagCategory);
      return {
        canProceed: false,
        uiAction: "open_crisis_chat",
        evaMessage: buildCrisisMessage(),
      };

    case "hard_block":
      // Letter is quarantined. User sees a neutral "under review"
      // message — never told exactly why, to avoid teaching bad
      // actors how to reword around the filter.
      await flagForHumanAwareness(letterId, userId, safetyResult.flagCategory);
      return {
        canProceed: false,
        uiAction: "show_under_review",
        evaMessage: "this one needs a closer look before it can go out. we'll be in touch if we need anything from you.",
      };

    default:
      // Should never happen, but fail safe — never let an unknown
      // pathway accidentally post unchecked.
      return {
        canProceed: false,
        uiAction: "show_under_review",
        evaMessage: "something went sideways on our end — this one's paused for now.",
      };
  }
}

function buildCrisisMessage(): string {
  return [
    "hey — what you just wrote matters, and I don't think this should go to a stranger right now.",
    "there are people trained for exactly this, available right now:",
    `${CRISIS_HELPLINES.primary.name} — ${CRISIS_HELPLINES.primary.type} (${CRISIS_HELPLINES.primary.url})`,
    `${CRISIS_HELPLINES.secondary.name} — ${CRISIS_HELPLINES.secondary.phone}, ${CRISIS_HELPLINES.secondary.type}`,
    "they don't call your parents. they don't contact your school. what you say stays between you and them.",
  ].join("\n");
}

// Marks a row in the log as needing a real human to look at it.
// This does NOT alert anyone yet (no email/SMS wiring) — it just
// makes the row visible in the review queue. Wiring real alerts
// is a later step, intentionally not built yet.
async function flagForHumanAwareness(
  letterId: string | null,
  userId: string | null,
  flagCategory: string
) {
  const supabase = getServiceClient();
  if (!supabase) return;

  // This just confirms the log entry (already written by safetyReader)
  // is marked pending — it's mostly a no-op right now since
  // runSafetyCheck already sets human_review_triggered correctly.
  // This function exists as the seam where real alerting (Slack
  // webhook, email, SMS) gets added later without touching the
  // safety reader itself.
  console.log(`[HUMAN REVIEW QUEUE] New item pending: category="${flagCategory}", letter=${letterId ?? "unsaved"}`);
}