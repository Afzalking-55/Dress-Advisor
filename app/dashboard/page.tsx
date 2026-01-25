"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import BottomNav from "../components/BottomNav";
import { ArrowRight, LogOut } from "lucide-react";

type WardrobeItem = {
  id: string;
  category: "Top" | "Bottom" | "Shoes" | "Other";
};

type TodayOutfitPayload = {
  pickedAt: number;
  occasion: string;
  mood: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [todayOutfit, setTodayOutfit] =
    useState<TodayOutfitPayload | null>(null);

  const [generated, setGenerated] = useState(false);

  // ✅ HARD CLIENT GATE
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return router.push("/auth");

      if (localStorage.getItem("setup_done") !== "1") {
        router.push("/setup");
        return;
      }

      setUser(u);

      try {
        setWardrobe(JSON.parse(localStorage.getItem("wardrobe_items") || "[]"));
        setTodayOutfit(JSON.parse(localStorage.getItem("today_outfit") || "null"));
        setGenerated(!!localStorage.getItem("outfit_history"));
      } catch {
        setWardrobe([]);
        setTodayOutfit(null);
        setGenerated(false);
      }
    });

    return () => unsub();
  }, [mounted, router]);

  if (!mounted) return null;

  const stats = useMemo(() => {
    return {
      total: wardrobe.length,
      shoes: wardrobe.filter((i) => i.category === "Shoes").length,
    };
  }, [wardrobe]);

  const completed =
    (stats.total > 0 ? 1 : 0) +
    (generated ? 1 : 0) +
    (todayOutfit ? 1 : 0);

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
          className="flex items-center gap-2 border px-4 py-2 rounded-full text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <p className="text-white/60 mt-2">
        Welcome back {user?.displayName || "Stylist"} 👋
      </p>

      <div className="border rounded-xl p-6 mt-6">
        Progress: {progress}%
      </div>

      <div className="border rounded-xl p-6 mt-6">
        <h3>{aiInsight}</h3>

        <Link
          href="/next-dress"
          className="inline-flex items-center gap-2 mt-4 bg-white text-black px-6 py-3 font-bold"
        >
          Generate Outfit <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <BottomNav />
    </main>
  );
}
