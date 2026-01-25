"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import BottomNav from "../components/BottomNav";
import { ArrowRight, LogOut } from "lucide-react";

/* ---------------- Types ---------------- */

type WardrobeItem = {
  id: string;
  category: "Top" | "Bottom" | "Shoes" | "Other";
};

type TodayOutfitPayload = {
  pickedAt: number;
  occasion: string;
  mood: string;
};

/* ---------------- Helpers ---------------- */

function safeGet(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function safeParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

function hasSetupDone() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("setup_done") === "1";
  } catch {
    return false;
  }
}

function Glass({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      {children}
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function DashboardPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [todayOutfit, setTodayOutfit] =
    useState<TodayOutfitPayload | null>(null);

  // ✅ Prevent SSR / hydration crash
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return router.push("/auth");
      if (!hasSetupDone()) return router.push("/setup");

      setUser(u);

      setWardrobe(safeParse(safeGet("wardrobe_items", "[]"), []));
      setTodayOutfit(safeParse(safeGet("today_outfit", "null"), null));
    });

    return () => unsub();
  }, [router]);

  /* ---------------- Stats ---------------- */

  const stats = useMemo(() => {
    return {
      total: wardrobe.length,
      shoes: wardrobe.filter((i) => i.category === "Shoes").length,
    };
  }, [wardrobe]);

  /* ---------------- Checklist ---------------- */

  const onboarding = {
    uploaded: stats.total > 0,
    generated:
      typeof window !== "undefined" &&
      !!localStorage.getItem("outfit_history"),
    picked: !!todayOutfit,
  };

  const completed =
    (onboarding.uploaded ? 1 : 0) +
    (onboarding.generated ? 1 : 0) +
    (onboarding.picked ? 1 : 0);

  const progress = Math.round((completed / 3) * 100);

  /* ---------------- AI Insight ---------------- */

  const aiInsight =
    stats.shoes === 0
      ? "Add shoes to improve outfit accuracy"
      : stats.total < 6
      ? "Upload more items for stronger results"
      : "Your wardrobe is ready — generate today’s outfit";

  return (
    <main className="min-h-screen text-white px-6 pt-10 pb-40 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold">Dress Advisor ✨</h1>

        <button
          onClick={async () => {
            await signOut(auth);
            router.push("/");
          }}
          className="flex items-center gap-2 border border-white/10 px-4 py-2 rounded-full text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Welcome */}
      <p className="text-white/60 mt-2">
        Welcome back {user?.displayName || "Stylist"} 👋
      </p>

      {/* Progress */}
      <Glass>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-extrabold">Getting Started</h3>
          <span className="text-white/50">{progress}%</span>
        </div>

        <div className="h-2 bg-black/40 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-white" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-2 text-sm">
          <div>{onboarding.uploaded ? "✅" : "⬜"} Upload clothes</div>
          <div>{onboarding.generated ? "✅" : "⬜"} Generate outfit</div>
          <div>{onboarding.picked ? "✅" : "⬜"} Pick today’s look</div>
        </div>
      </Glass>

      {/* AI Insight */}
      <Glass>
        <p className="text-xs uppercase text-white/50">AI Insight</p>
        <h3 className="text-xl font-extrabold mt-2">{aiInsight}</h3>

        <Link
          href="/next-dress"
          className="inline-flex items-center gap-2 mt-4 rounded-full bg-white text-black px-6 py-3 font-bold"
        >
          Generate Outfit <ArrowRight className="w-4 h-4" />
        </Link>
      </Glass>

      <BottomNav />
    </main>
  );
}
