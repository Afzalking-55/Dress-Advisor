"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Loader2,
  AlertTriangle,
  Star,
  Brain,
  ShieldCheck,
  Zap,
} from "lucide-react";

/* ----------------------------- Types ----------------------------- */

type OutfitItem = {
  id: string;
  imageUrl?: string | null;
  category?: string | null;
  color?: string | null;
};

type OutfitCard = {
  title: string;
  styleMode: "safe" | "attraction" | "statement";
  score: number;
  confidence: number;
  reasons: string[];
  warnings: string[];
  personalization?: {
    boost: number;
    reasons: string[];
    penalties: string[];
  } | null;
  items: {
    top: OutfitItem | null;
    bottom: OutfitItem | null;
    shoes: OutfitItem | null;
    outer: OutfitItem | null;
    accessory: OutfitItem | null;
  };
};

type ChatResponse = {
  ok: boolean;
  occasion: string;
  cached?: boolean;
  assistant: {
    intro: string;
    psychology: string;
    outfits: OutfitCard[];
  };
};

/* ----------------------------- Utils ----------------------------- */

function cn(...c: (string | boolean | undefined | null)[]) {
  return c.filter(Boolean).join(" ");
}

async function postJSON(path: string, body: any) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Request failed");
  return json;
}

/* ----------------------------- Skeleton ----------------------------- */

function OutfitSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4 animate-pulse">
      <div className="h-4 w-32 bg-white/10 rounded" />
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-square bg-white/10 rounded-xl" />
        ))}
      </div>
      <div className="h-3 w-full bg-white/10 rounded" />
      <div className="h-3 w-3/4 bg-white/10 rounded" />
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="w-8 h-8 bg-white/10 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Page ----------------------------- */

export default function DressAIPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [message, setMessage] = useState(
    "Tomorrow is a wedding. I want premium look but not steal attention."
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<ChatResponse | null>(null);
  const [error, setError] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/auth");
        return;
      }
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  /* ----------------------------- Actions ----------------------------- */

  const handleChat = async () => {
    if (!user || !message.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res: ChatResponse = await postJSON("/api/outfits/chat", {
        uid: user.uid,
        message,
      });
      setChat(res);
    } catch (e: any) {
      setError(e?.message || "Chat failed");
    } finally {
      setLoading(false);
      setMessage("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const rateOutfit = async (outfit: OutfitCard, stars: number) => {
    if (!user) return;
    setRatingLoading(true);

    try {
      await postJSON("/api/outfits/rate", {
        uid: user.uid,
        occasion: chat?.occasion,
        outfit: {
          top: outfit.items.top?.id,
          bottom: outfit.items.bottom?.id,
          shoes: outfit.items.shoes?.id,
          outer: outfit.items.outer?.id,
          accessory: outfit.items.accessory?.id,
        },
        rating: stars,
      });

      const res: ChatResponse = await postJSON("/api/outfits/chat", {
        uid: user.uid,
        message: "Same occasion. Give best outfit again.",
      });
      setChat(res);

      setToast("DressAI updated your taste preferences");
      setTimeout(() => setToast(null), 2200);
    } catch (e: any) {
      alert(e?.message || "Rating failed");
    } finally {
      setRatingLoading(false);
    }
  };

  /* ----------------------------- Render ----------------------------- */

  return (
    <main className="min-h-screen relative overflow-hidden text-white pb-28">
      <div className="absolute inset-0 bg-[#05040b]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-white/10 bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> DressAI
            </span>
            <span className="px-3 py-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" /> Learning
            </span>
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Premium
            </span>
          </div>
        </div>

        {/* Input */}
        <div className="mt-8 flex gap-3">
          <input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChat()}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            placeholder="Describe your occasion"
          />
          <button
            onClick={handleChat}
            disabled={loading || !message.trim()}
            className={cn(
              "rounded-2xl px-5 py-3 font-bold",
              loading || !message.trim()
                ? "bg-white/30 text-white/60 cursor-not-allowed"
                : "bg-white text-black hover:bg-white/90"
            )}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send />}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm">
            <AlertTriangle className="inline w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {loading && !chat && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <OutfitSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && !chat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-10 text-center text-white/60"
            >
              Ask DressAI about an occasion to see outfit suggestions.
            </motion.div>
          )}

          {!loading && chat && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-bold">
                  Occasion: {chat.occasion}
                </div>

                <div
                  className={cn(
                    "text-xs px-3 py-1 rounded-full border flex items-center gap-1",
                    chat.cached
                      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                      : "border-white/15 bg-white/5 text-white/70"
                  )}
                >
                  {chat.cached ? <Zap className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
                  {chat.cached ? "Instant result" : "Fresh analysis"}
                </div>
              </div>

              <div className="text-white/70 mb-6">
                {chat.assistant.intro}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {chat.assistant.outfits.map((o) => (
                  <div
                    key={o.styleMode}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="font-bold">{o.title}</div>
                    <div className="text-xs text-white/60">
                      Confidence: {(o.confidence * 100).toFixed(0)}%
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[o.items.top, o.items.bottom, o.items.shoes].map(
                        (it, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-xl bg-black/40 overflow-hidden flex items-center justify-center text-xs"
                          >
                            {it?.imageUrl ? (
                              <img
                                src={it.imageUrl}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "—"
                            )}
                          </div>
                        )
                      )}
                    </div>

                    <div className="mt-3 text-xs text-emerald-200">
                      {o.reasons.join(" • ")}
                    </div>

                    {o.warnings.length > 0 && (
                      <div className="mt-2 text-xs text-amber-200">
                        {o.warnings.join(" • ")}
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          disabled={ratingLoading}
                          onClick={() => rateOutfit(o, s)}
                          className="w-8 h-8 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-50"
                        >
                          <Star className="w-4 h-4 mx-auto" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
                       rounded-full px-5 py-2 text-sm font-semibold
                       border border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
          >
            🧠 {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0">
        <BottomNav />
      </div>
    </main>
  );
}
