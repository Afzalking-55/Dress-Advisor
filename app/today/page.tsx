"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
} from "lucide-react";

function cn(...c: (string | boolean | undefined | null)[]) {
  return c.filter(Boolean).join(" ");
}

function titleCase(s: string) {
  return (s || "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type WardrobeItem = {
  id?: string;
  category?: "Top" | "Bottom" | "Shoes" | "Other";
  imageUrl?: string;
  createdAt?: number;
  colorName?: string;
  aiName?: string;
  occasions?: string[];
  clothType?: string;
};

type TodayData = {
  pickedAt: number;
  occasion?: string;
  mood?: string;
  outfit?: {
    top?: WardrobeItem;
    bottom?: WardrobeItem;
    shoes?: WardrobeItem;
    score?: number; // 0..100
    reason?: string[];
  };
};

function Glass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px]",
        "border border-white/10 bg-white/[0.06] backdrop-blur-2xl",
        "shadow-[0_24px_110px_rgba(0,0,0,0.65)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(236,72,153,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(245,158,11,0.10),transparent_65%)]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  // ✅ outfitBrain already returns 0..100
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs text-white/55">
        <span>Style score</span>
        <span className="text-white/85 font-semibold">{pct}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-black/30 border border-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-fuchsia-400 via-purple-400 to-amber-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Pill({
  text,
  icon,
}: {
  text: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/12 bg-white/8 text-white/80">
      {icon}
      {text}
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div className="rounded-full border border-white/12 bg-black/60 backdrop-blur-xl px-5 py-3 text-sm font-semibold text-white/90 shadow-[0_20px_100px_rgba(0,0,0,0.6)]">
      {text}
    </div>
  );
}

function itemLabel(item?: WardrobeItem) {
  return item?.aiName || item?.clothType || item?.colorName || "Any";
}

export default function TodayPage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("today_outfit");
    setData(saved ? JSON.parse(saved) : null);
  }, []);

  const savedTime = useMemo(() => {
    if (!data?.pickedAt) return "";
    try {
      return new Date(data.pickedAt).toLocaleString();
    } catch {
      return "";
    }
  }, [data?.pickedAt]);

  const reset = () => {
    localStorage.removeItem("today_outfit");
    setData(null);
    setConfirmReset(false);
    setToast("🧹 Reset done");
    setTimeout(() => setToast(""), 1800);
  };

  const copyShareText = async () => {
    if (!data?.outfit) return;

    const o = data.outfit;

    const txt = [
      `✨ DressAI — Today Outfit`,
      ``,
      `Occasion: ${titleCase(data.occasion || "—")}`,
      `Mood: ${titleCase(data.mood || "—")}`,
      `Score: ${Math.round(o.score || 0)}%`,
      ``,
      `Top: ${itemLabel(o.top)} ${o.top?.colorName ? `(${o.top.colorName})` : ""}`,
      `Bottom: ${itemLabel(o.bottom)} ${o.bottom?.colorName ? `(${o.bottom.colorName})` : ""}`,
      `Shoes: ${itemLabel(o.shoes)} ${o.shoes?.colorName ? `(${o.shoes.colorName})` : ""}`,
      ``,
      `Why:`,
      ...(o.reason || []).slice(0, 10),
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(txt);
    setToast("📋 Copied share card ✅");
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <main className="min-h-screen relative overflow-hidden text-white pb-28">
      {/* ROYAL GALAXY BACKGROUND */}
      <div className="absolute inset-0 bg-[#06040b]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(236,72,153,0.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(245,158,11,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-black/35" />

      {/* glows */}
      <div className="pointer-events-none absolute -top-52 left-1/4 h-[520px] w-[520px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-0 h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              Today Outfit ✅
            </h1>
            <p className="text-white/60 mt-3 text-base md:text-lg">
              Your chosen fit for today — saved by DressAI.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 hover:bg-white/12 px-5 py-3 text-sm font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </motion.div>

        {!data ? (
          <Glass className="mt-10 p-10 text-center">
            <p className="text-white/70 text-lg font-semibold">
              No outfit chosen yet.
            </p>
            <p className="text-white/50 text-sm mt-2">
              Pick one in Next Dress AI to save it here.
            </p>

            <Link
              href="/next-dress"
              className="inline-flex items-center gap-2 mt-7 px-7 py-4 rounded-2xl bg-white text-black font-extrabold hover:scale-[1.01] transition"
            >
              <Sparkles className="w-5 h-5" />
              Go Pick One
            </Link>
          </Glass>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <Glass className="p-7 md:p-9">
              {/* top meta */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div>
                  <div className="text-2xl font-extrabold tracking-tight">
                    Today’s Fit
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill
                      text={`Occasion: ${titleCase(data.occasion || "—")}`}
                      icon={<CheckCircle2 className="w-4 h-4 opacity-70" />}
                    />
                    <Pill
                      text={`Mood: ${titleCase(data.mood || "—")}`}
                      icon={<Sparkles className="w-4 h-4 opacity-70" />}
                    />
                    <Pill
                      text={`Saved: ${savedTime || "—"}`}
                      icon={<Clock className="w-4 h-4 opacity-70" />}
                    />
                  </div>

                  <ScoreBar score={data?.outfit?.score || 0} />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyShareText}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 hover:bg-white/12 px-5 py-3 text-sm font-semibold transition"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Share Card
                  </button>

                  <button
                    onClick={() => setConfirmReset(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 hover:bg-white/12 px-5 py-3 text-sm font-semibold transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </div>

              {/* outfit grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                {(["top", "bottom", "shoes"] as const).map((k) => {
                  const item = (data?.outfit as any)?.[k] as WardrobeItem | undefined;
                  return (
                    <div
                      key={k}
                      className="rounded-3xl border border-white/10 bg-black/30 overflow-hidden"
                    >
                      <div className="h-[220px] bg-black/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {item?.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            className="w-full h-full object-cover"
                            alt={item.aiName || k}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
                            Missing
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="text-xs text-white/40 capitalize">
                          {k}
                        </div>
                        <div className="text-lg font-extrabold mt-1">
                          {itemLabel(item)}
                        </div>
                        <div className="text-sm text-white/50 mt-1">
                          {item?.colorName || ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* reasoning */}
              <div className="mt-8">
                <div className="text-white font-extrabold text-lg mb-3">
                  Why DressAI chose this
                </div>
                <div className="text-white/70 text-sm space-y-2">
                  {(data?.outfit?.reason || []).slice(0, 18).map((r: string, i: number) => (
                    <div key={i}>• {r}</div>
                  ))}
                </div>
              </div>

              {/* actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-10">
                <Link
                  href="/next-dress"
                  className="flex-1 text-center px-6 py-4 rounded-2xl bg-white text-black font-extrabold hover:scale-[1.01] transition"
                >
                  Choose Another
                </Link>
                <Link
                  href="/history"
                  className="flex-1 text-center px-6 py-4 rounded-2xl border border-white/12 bg-white/8 hover:bg-white/12 font-semibold transition"
                >
                  View History
                </Link>
              </div>
            </Glass>
          </motion.div>
        )}
      </div>

      {/* toast */}
      <AnimatePresence>
        {!!toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[999] px-6"
          >
            <Toast text={toast} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* confirm reset modal */}
      <AnimatePresence>
        {confirmReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-md"
            >
              <Glass className="p-7">
                <h3 className="text-2xl font-extrabold">Reset today outfit?</h3>
                <p className="mt-2 text-sm text-white/60">
                  This removes today’s saved outfit. You can pick again anytime.
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 rounded-2xl border border-white/12 bg-white/8 hover:bg-white/12 px-5 py-3 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={reset}
                    className="flex-1 rounded-2xl bg-white text-black px-5 py-3 font-extrabold hover:scale-[1.01] transition"
                  >
                    Reset
                  </button>
                </div>
              </Glass>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </main>
  );
}
