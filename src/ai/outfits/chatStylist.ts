import type { OccasionKey } from "./occasionPsychology";

/**
 * DressAI Stylist Intent + Response Text
 *
 * ✅ Goal:
 * - infer best occasion from message
 * - infer tone ("safe" | "attraction" | "statement" | "balanced")
 * - produce intro + psychology
 */

export type StylistTone = "safe" | "attraction" | "statement" | "balanced";

export type StylistIntent = {
  occasion: OccasionKey;
  tone: StylistTone;
  confidence: number; // 0..1
  matched: string[]; // keyword matches
};

function norm(s: string) {
  return String(s || "").toLowerCase().trim();
}

function includesAny(msg: string, keys: string[]) {
  const m = norm(msg);
  return keys.some((k) => m.includes(k));
}

/**
 * ✅ MAIN: Occasion + Tone inference
 */
export function inferIntentFromMessage(message: string): StylistIntent {
  const msg = norm(message);

  const matched: string[] = [];
  let occasion: OccasionKey = "casual_hangout"; // ✅ default
  let confidence = 0.42;

  // --- Occasion detection (more specific first) ---

  if (
    includesAny(msg, [
      "wedding",
      "shaadi",
      "marriage",
      "baraat",
      "reception",
      "nikah",
      "mehendi",
      "haldi",
    ])
  ) {
    occasion = "wedding_guest";
    confidence = 0.95;
    matched.push("wedding");
  } else if (
    includesAny(msg, [
      "interview",
      "job interview",
      "hr round",
      "placement",
      "campus placement",
    ])
  ) {
    occasion = "interview";
    confidence = 0.92;
    matched.push("interview");
  } else if (
    includesAny(msg, [
      "office",
      "work",
      "meeting",
      "client",
      "presentation",
      "startup",
      "boss",
      "corporate",
    ])
  ) {
    occasion = "office";
    confidence = 0.84;
    matched.push("office/work");
  } else if (
    includesAny(msg, [
      "college",
      "class",
      "university",
      "campus",
      "lecture",
      "exam",
      "test",
    ])
  ) {
    occasion = "college";
    confidence = 0.84;
    matched.push("college/class");
  } else if (includesAny(msg, ["gym", "workout", "training", "fitness", "run"])) {
    occasion = "gym";
    confidence = 0.9;
    matched.push("gym");
  } else if (includesAny(msg, ["club", "night club", "bar", "dj", "dance"])) {
    occasion = "club_night";
    confidence = 0.88;
    matched.push("club");
  } else if (includesAny(msg, ["party", "birthday", "celebration"])) {
    occasion = "party";
    confidence = 0.82;
    matched.push("party");
  } else if (
    includesAny(msg, [
      "date",
      "girlfriend",
      "boyfriend",
      "crush",
      "romantic",
      "dinner date",
    ])
  ) {
    // if it's daytime
    if (includesAny(msg, ["morning", "day", "afternoon", "lunch"])) {
      occasion = "date_day";
      confidence = 0.82;
      matched.push("date_day");
    } else {
      occasion = "romantic_dinner";
      confidence = 0.82;
      matched.push("romantic_dinner");
    }
  } else if (includesAny(msg, ["festival", "diwali", "eid", "christmas", "holi"])) {
    occasion = "festival";
    confidence = 0.78;
    matched.push("festival");
  } else if (includesAny(msg, ["travel", "trip", "flight", "airport", "journey"])) {
    occasion = "travel";
    confidence = 0.74;
    matched.push("travel");
  } else if (includesAny(msg, ["funeral"])) {
    occasion = "funeral";
    confidence = 0.95;
    matched.push("funeral");
  } else if (includesAny(msg, ["streetwear", "street style"])) {
    occasion = "streetwear";
    confidence = 0.72;
    matched.push("streetwear");
  } else {
    // ✅ fallback casual
    occasion = "casual_hangout";
    confidence = 0.55;
    matched.push("casual_fallback");
  }

  // --- Tone detection ---
  // By default: balanced
  let tone: StylistTone = "balanced";

  if (
    includesAny(msg, [
      "safe",
      "simple",
      "no risk",
      "decent",
      "minimal",
      "not flashy",
      "premium but not steal attention",
      "not steal attention",
    ])
  ) {
    tone = "safe";
    matched.push("tone_safe");
  } else if (
    includesAny(msg, ["attractive", "impress", "crush", "hot", "sexy", "charming"])
  ) {
    tone = "attraction";
    matched.push("tone_attraction");
  } else if (
    includesAny(msg, [
      "stand out",
      "statement",
      "bold",
      "different",
      "unique",
      "attention",
    ])
  ) {
    tone = "statement";
    matched.push("tone_statement");
  }

  return {
    occasion,
    tone,
    confidence,
    matched,
  };
}

/**
 * ✅ Response Text Builder
 * (your API route uses this)
 */
export function buildStylistResponseText(params: {
  occasion: OccasionKey;
  tone?: StylistTone;
}) {
  const { occasion, tone = "balanced" } = params;

  const base: Record<
    OccasionKey,
    { intro: string; psychology: string }
  > = {
    romantic_dinner: {
      intro:
        "Alright. Romantic Dinner = attraction + mature confidence without trying too hard.",
      psychology:
        "In romantic settings, clean fit + deep tones signal intention, confidence, and masculinity.",
    },
    casual: {
      intro: "Casual vibe. Let’s keep it clean, chill and confident.",
      psychology:
        "Casual is about looking relaxed but intentional — clean fit beats overdressing.",
    },
    casual_hangout: {
      intro: "Casual hangout = effortless cool and friendly vibe.",
      psychology:
        "People respond best to comfort + clean aesthetics in casual events. Keep it simple.",
    },
    interview: {
      intro: "Interview = maximum trust + sharp professional vibe.",
      psychology:
        "Neutral tones, clean fit, and formality cues strongly increase credibility.",
    },
    office: {
      intro: "Office/work = smart, clean, and capable style.",
      psychology:
        "Work outfits should signal competence but still feel approachable.",
    },
    wedding_guest: {
      intro:
        "Alright. Wedding Guest = Look elegant and respectful without stealing spotlight.",
      psychology:
        "Weddings reward premium elegance — avoid extreme attention grabbing colors.",
    },
    party: {
      intro: "Party = stylish + confident with some fun energy.",
      psychology:
        "Social events reward charisma — slightly bolder choices feel better here.",
    },
    club_night: {
      intro: "Club night = bold, attractive, high confidence vibe.",
      psychology:
        "Night settings reward sharp silhouettes + statement energy.",
    },
    date_day: {
      intro: "Day date = warm, friendly, cute but still clean.",
      psychology:
        "Day dates reward approachability. Softer tones feel welcoming and charming.",
    },
    travel: {
      intro: "Travel = comfort first but still clean and stylish.",
      psychology:
        "Long journeys need comfort. Still, clean fit keeps your look premium.",
    },
    gym: {
      intro: "Gym = sporty, functional, confident.",
      psychology:
        "Gym outfits are about movement. Comfort and breathable pieces win.",
    },
    funeral: {
      intro: "Funeral = respectful and silent. No attention.",
      psychology:
        "Funerals demand minimalism. Dark neutral tones and simplicity show respect.",
    },
    festival: {
      intro: "Festival = expressive, joyful, energetic style.",
      psychology:
        "Festivals reward vibrant personality. Expression is socially encouraged.",
    },
    family_dinner: {
      intro: "Family dinner = mature, respectful, warm vibe.",
      psychology:
        "Family settings reward clean maturity. Respect + calm colors win.",
    },
    presentation: {
      intro: "Presentation = authority, confidence, premium vibe.",
      psychology:
        "On stage, outfits influence perception. Sharp formality increases authority.",
    },
    college: {
      intro: "College = comfortable, cool, clean confidence.",
      psychology:
        "College style is about vibe. Casual but clean gives the best look.",
    },
    streetwear: {
      intro: "Streetwear = bold vibe, identity, statement fit.",
      psychology:
        "Streetwear is self-expression — statement pieces matter most here.",
    },
  };

  const p = base[occasion] || base.casual_hangout;

  // tone modifier
  let toneLine = "";
  if (tone === "safe") toneLine = " I’ll keep it safe and premium ✅";
  if (tone === "attraction") toneLine = " I’ll optimize attraction 🔥";
  if (tone === "statement") toneLine = " I’ll go for a statement fit ⚡";

  return {
    intro: `${p.intro}${toneLine}`,
    psychology: p.psychology,
  };
}
