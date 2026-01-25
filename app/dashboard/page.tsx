"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

/* ---------------- Safe browser helpers ---------------- */

const safeGet = (key: string) =>
  typeof window === "undefined" ? null : localStorage.getItem(key);

const safeParse = <T,>(v: string | null, fallback: T): T => {
  try {
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [todayOutfit, setTodayOutfit] =
    useState<TodayOutfitPayload | null>(null);

  /* CLIENT ONLY */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return router.push("/auth");

      setUser(u);

      setWardrobe(safeParse(safeGet("wardrobe_items"), []));
      setTodayOutfit(safeParse(safeGet("today_outfit"), null));
    });

    return () => unsub();
  }, [router]);

  const stats = useMemo(() => {
    return {
      total: wardrobe.length,
      shoes: wardrobe.filter((i) => i.category === "Shoes").length,
    };
  }, [wardrobe]);

  const onboarding = {
    uploaded: stats.total > 0,
    generated: typeof window !== "undefined"
      ? !!localStorage.getItem("outfit_history")
      : false,
    picked: !!todayOutfit,
  };

  const completed =
    (onboarding.uploaded ? 1 : 0) +
    (onboarding.generated ? 1 : 0) +
    (onboarding.picked ? 1 : 0);

  const progress = Math.round((completed / 3) * 100);

  const aiInsight =
    stats.shoes === 0
      ? "Add shoes to improve outfit accuracy"
      : stats.total < 6
      ? "Upload more items for stronger results"
      : "Your wardrobe is ready — generate today’s outfit";

  return (
    <main className="min-h-screen text-white px-6 pt-10 pb-40 max-w-6xl mx-auto">
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

      <p className="text-white/60 mt-2">
        Welcome back {user?.displayName || "Stylist"} 👋
      </p>

      <div className="rounded-xl border p-6 mt-6">
        <p>Progress: {progress}%</p>
        <p>{aiInsight}</p>

        <Link
          href="/next-dress"
          className="inline-flex items-center gap-2 mt-4 bg-white text-black px-6 py-3 rounded-full"
        >
          Generate Outfit <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <BottomNav />
    </main>
  );
}
