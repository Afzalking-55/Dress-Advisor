export type OccasionKey =
  | "romantic_dinner"
  | "casual" // ✅ ADDED (fix for ts error)
  | "casual_hangout"
  | "interview"
  | "office"
  | "wedding_guest"
  | "party"
  | "club_night"
  | "date_day"
  | "travel"
  | "gym"
  | "funeral"
  | "festival"
  | "family_dinner"
  | "presentation"
  | "college"
  | "streetwear";

export type OccasionProfile = {
  key: OccasionKey;
  title: string;

  // 0..1
  formalityTarget: number; // desired
  formalityRange: [number, number];

  vibeTags: string[]; // tags we want
  avoidTags: string[]; // tags we don't want

  // color vibes (not strict)
  colorPref: string[];
  avoidColors: string[];

  // explanation psychology
  psychology: {
    goal: string;
    impression: string[];
    whyItWorks: string[];
  };
};

export const OCCASIONS: Record<OccasionKey, OccasionProfile> = {
  romantic_dinner: {
    key: "romantic_dinner",
    title: "Romantic Dinner",
    formalityTarget: 0.72,
    formalityRange: [0.55, 0.9],
    vibeTags: ["classy", "attractive", "warm", "intentional", "clean"],
    avoidTags: ["gym", "dirty", "oversized", "messy", "too_sporty"],
    colorPref: ["black", "white", "navy", "burgundy", "earth"],
    avoidColors: ["neon"],
    psychology: {
      goal: "Attraction + confidence without looking like you're trying too hard.",
      impression: [
        "Intentional",
        "Clean & confident",
        "Mature and attractive",
        "Warm & approachable",
      ],
      whyItWorks: [
        "Romantic settings reward effort and clean styling.",
        "Balanced formality signals respect and value.",
        "Neutral/deep colors amplify elegance and attraction.",
      ],
    },
  },

  // ✅ ADDED: "casual" profile (for generic 'casual' intent)
  casual: {
    key: "casual",
    title: "Casual (Generic)",
    formalityTarget: 0.32,
    formalityRange: [0.1, 0.6],
    vibeTags: ["casual", "relaxed", "comfortable", "clean", "cool"],
    avoidTags: ["too_formal", "interview", "wedding", "club"],
    colorPref: ["white", "black", "blue", "grey", "earth"],
    avoidColors: ["neon"],
    psychology: {
      goal: "Look comfortable but still stylish and clean.",
      impression: ["Effortless", "Friendly", "Relaxed", "Cool"],
      whyItWorks: [
        "Most everyday situations reward comfort + clean styling.",
        "Casual outfits should look intentional, not lazy.",
      ],
    },
  },

  casual_hangout: {
    key: "casual_hangout",
    title: "Casual Hangout",
    formalityTarget: 0.35,
    formalityRange: [0.15, 0.55],
    vibeTags: ["relaxed", "cool", "comfortable", "friendly"],
    avoidTags: ["too_formal", "wedding"],
    colorPref: ["white", "black", "blue", "green", "earth"],
    avoidColors: [],
    psychology: {
      goal: "Look effortlessly cool and approachable.",
      impression: ["Easy-going", "Clean", "Stylish without effort"],
      whyItWorks: [
        "Casual events reward comfort + a clean look.",
        "Over-dressing creates social distance.",
      ],
    },
  },

  interview: {
    key: "interview",
    title: "Interview",
    formalityTarget: 0.88,
    formalityRange: [0.7, 1],
    vibeTags: ["professional", "sharp", "trustworthy", "clean", "confident"],
    avoidTags: ["club", "party", "streetwear", "messy", "ripped"],
    colorPref: ["navy", "black", "white", "grey"],
    avoidColors: ["neon", "flashy"],
    psychology: {
      goal: "Maximize trust and competence signals.",
      impression: ["Professional", "Reliable", "Focused", "Serious"],
      whyItWorks: [
        "Interviews are about trust + competence cues.",
        "Neutral colors reduce distraction and increase credibility.",
      ],
    },
  },

  office: {
    key: "office",
    title: "Office / Work",
    formalityTarget: 0.68,
    formalityRange: [0.45, 0.85],
    vibeTags: ["professional", "clean", "smart", "comfortable"],
    avoidTags: ["club", "messy", "too_sporty"],
    colorPref: ["black", "white", "navy", "grey", "brown"],
    avoidColors: ["neon"],
    psychology: {
      goal: "Look capable, clean, and easy to work with.",
      impression: ["Smart", "Competent", "Approachable"],
      whyItWorks: [
        "Office outfits should be smart without feeling aggressive.",
        "Clean lines improve authority and clarity.",
      ],
    },
  },

  wedding_guest: {
    key: "wedding_guest",
    title: "Wedding Guest",
    formalityTarget: 0.82,
    formalityRange: [0.6, 1],
    vibeTags: ["formal", "celebratory", "elegant", "premium"],
    avoidTags: ["gym", "dirty", "ripped"],
    colorPref: ["navy", "black", "beige", "pastel", "maroon"],
    avoidColors: ["too_white"], // avoid looking like groom/bride vibes
    psychology: {
      goal: "Look elegant and respectful without stealing spotlight.",
      impression: ["Elegant", "Well-mannered", "Celebratory"],
      whyItWorks: [
        "Weddings reward elegance and respect.",
        "Avoid extreme attention colors unless culture requires.",
      ],
    },
  },

  party: {
    key: "party",
    title: "Party",
    formalityTarget: 0.55,
    formalityRange: [0.35, 0.8],
    vibeTags: ["stylish", "fun", "confident"],
    avoidTags: ["interview", "too_formal"],
    colorPref: ["black", "white", "red", "blue", "metallic"],
    avoidColors: [],
    psychology: {
      goal: "Stand out but still look sharp.",
      impression: ["Fun", "Confident", "Stylish"],
      whyItWorks: ["Parties reward charisma and a bolder vibe."],
    },
  },

  club_night: {
    key: "club_night",
    title: "Club Night",
    formalityTarget: 0.6,
    formalityRange: [0.35, 0.85],
    vibeTags: ["bold", "attractive", "statement", "clean"],
    avoidTags: ["office", "interview", "too_formal"],
    colorPref: ["black", "dark", "red"],
    avoidColors: [],
    psychology: {
      goal: "High attraction + high confidence vibe.",
      impression: ["Bold", "Sexy", "Confident"],
      whyItWorks: ["Night settings reward bold statements and clean fit."],
    },
  },

  date_day: {
    key: "date_day",
    title: "Day Date",
    formalityTarget: 0.52,
    formalityRange: [0.35, 0.75],
    vibeTags: ["warm", "friendly", "clean", "cute"],
    avoidTags: ["too_formal"],
    colorPref: ["white", "blue", "earth", "pastel"],
    avoidColors: ["neon"],
    psychology: {
      goal: "Warm + charming, approachable style.",
      impression: ["Cute", "Clean", "Friendly"],
      whyItWorks: ["Day dates reward warmth and friendliness."],
    },
  },

  travel: {
    key: "travel",
    title: "Travel",
    formalityTarget: 0.28,
    formalityRange: [0.1, 0.55],
    vibeTags: ["comfortable", "clean", "practical", "cool"],
    avoidTags: ["too_formal"],
    colorPref: ["black", "grey", "blue", "earth"],
    avoidColors: [],
    psychology: {
      goal: "Comfort + clean aesthetics.",
      impression: ["Practical", "Put-together"],
      whyItWorks: ["Travel is long hours; comfort first but clean look matters."],
    },
  },

  gym: {
    key: "gym",
    title: "Gym",
    formalityTarget: 0.1,
    formalityRange: [0, 0.25],
    vibeTags: ["gym", "sporty", "comfortable"],
    avoidTags: ["formal"],
    colorPref: ["black", "grey", "blue"],
    avoidColors: [],
    psychology: {
      goal: "Function and confidence.",
      impression: ["Athletic", "Focused"],
      whyItWorks: ["Fitness vibe. No overthinking."],
    },
  },

  funeral: {
    key: "funeral",
    title: "Funeral",
    formalityTarget: 0.82,
    formalityRange: [0.6, 1],
    vibeTags: ["respectful", "simple", "formal"],
    avoidTags: ["bold", "statement", "party"],
    colorPref: ["black", "dark", "grey"],
    avoidColors: ["bright", "neon"],
    psychology: {
      goal: "Respect and silence (no attention).",
      impression: ["Respectful", "Serious"],
      whyItWorks: ["The moment is not about you. Blend respectfully."],
    },
  },

  festival: {
    key: "festival",
    title: "Festival",
    formalityTarget: 0.45,
    formalityRange: [0.2, 0.75],
    vibeTags: ["fun", "colorful", "comfortable", "expressive"],
    avoidTags: ["too_formal"],
    colorPref: ["bright", "earth", "white"],
    avoidColors: [],
    psychology: {
      goal: "Expressive and joyful.",
      impression: ["Fun", "Energetic"],
      whyItWorks: ["Festivals reward self-expression."],
    },
  },

  family_dinner: {
    key: "family_dinner",
    title: "Family Dinner",
    formalityTarget: 0.55,
    formalityRange: [0.35, 0.8],
    vibeTags: ["clean", "mature", "warm", "respectful"],
    avoidTags: ["too_bold", "club"],
    colorPref: ["earth", "white", "navy", "grey"],
    avoidColors: [],
    psychology: {
      goal: "Respect + warmth.",
      impression: ["Mature", "Respectful", "Comfortable"],
      whyItWorks: ["Family settings reward warmth and clean maturity."],
    },
  },

  presentation: {
    key: "presentation",
    title: "Presentation / On Stage",
    formalityTarget: 0.8,
    formalityRange: [0.55, 1],
    vibeTags: ["authority", "sharp", "clean", "premium"],
    avoidTags: ["messy", "too_casual"],
    colorPref: ["black", "navy", "white", "grey"],
    avoidColors: ["neon"],
    psychology: {
      goal: "Authority + confidence.",
      impression: ["Leader", "Confident", "Professional"],
      whyItWorks: ["Strong outfits improve perceived competence on stage."],
    },
  },

  college: {
    key: "college",
    title: "College / Class",
    formalityTarget: 0.25,
    formalityRange: [0.1, 0.55],
    vibeTags: ["comfortable", "cool", "clean"],
    avoidTags: ["too_formal"],
    colorPref: ["white", "black", "blue", "green"],
    avoidColors: [],
    psychology: {
      goal: "Comfort + confidence.",
      impression: ["Cool", "Approachable"],
      whyItWorks: ["College style is about comfort and vibe."],
    },
  },

  streetwear: {
    key: "streetwear",
    title: "Streetwear",
    formalityTarget: 0.35,
    formalityRange: [0.15, 0.65],
    vibeTags: ["streetwear", "cool", "bold", "statement"],
    avoidTags: ["interview"],
    colorPref: ["black", "white", "neon"],
    avoidColors: [],
    psychology: {
      goal: "Make a style statement.",
      impression: ["Trendy", "Bold"],
      whyItWorks: ["Streetwear is identity. Statement pieces matter."],
    },
  },
};
