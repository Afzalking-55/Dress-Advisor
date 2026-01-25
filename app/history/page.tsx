"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Trash2,
  Copy,
  TrendingUp,
  Hash,
  Trophy,
} from "lucide-react";

type HistoryItem = {
  pickedAt: number;
  occasion?: string;
  mood?: string;
  outfit?: {
    top?: any;
    bottom?: any;
    shoes?: any;
    score?: number;
    reason?: string[];
  };
};

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

/* ---------------- Premium UI Components ---------------- */

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

function StatCard({
  title,
  value,
  icon,
  sub,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
}) {
  return (
    <Glass className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase text-white/55">
            {title}
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            {value}
          </div>
          <p className="mt-2 text-sm text-white/55">{sub}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl border border-white/12 bg-white/8 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Glass>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((score / 30) * 100)));
  return (
    <div className="mt-3">
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
  active,
  onClick,
}: {
  text: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-semibold transition border",
        active
          ? "bg-white text-black border-white"
          : "bg-white/8 border-white/12 text-white/80 hover:bg-white/12"
      )}
    >
      {text}
    </button>
  );
}

/* ---------------------- Page ---------------------- */

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("outfit_history");
    setHistory(raw ? JSON.parse(raw) : []);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("outfit_history");
    setHistory([]);
    setConfirmClear(false);
  };

  const stats = useMemo(() => {
    const total = history.length;
    const avg =
      total === 0
        ? 0
        : Math.round(
            history.reduce((sum, x) => sum + (x.outfit?.score || 0), 0) / total
          );

    const occCount: Record<string, number> = {};
    const moodCount: Record<string, number> = {};

    history.forEach((h) => {
      const o = titleCase(h.occasion || "Unknown");
      const m = titleCase(h.mood || "Unknown");
      occCount[o] = (occCount[o] || 0) + 1;
      moodCount[m] = (moodCount[m] || 0) + 1;
    });

    const bestOcc =
      Object.entries(occCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    const bestMood =
      Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return { total, avg, bestOcc, bestMood };
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (filter === "All") return history;
    return history.filter(
      (h) =>
        titleCase(h.occasion || "") === filter || titleCase(h.mood || "") === filter
    );
  }, [history, filter]);

  const filterTabs = useMemo(() => {
    const tabs = new Set<string>();
    history.forEach((h) => {
      if (h.occasion) tabs.add(titleCase(h.occasion));
      if (h.mood) tabs.add(titleCase(h.mood));
    });
    return ["All", ...Array.from(tabs).slice(0, 10)];
  }, [history]);

  const copyShare = async (h: HistoryItem) => {
    const o = h.outfit || {};
    const txt = [
      `✨ DressAI Outfit`,
      `Date: ${new Date(h.pickedAt).toLocaleDateString()}`,
      `Occasion: ${titleCase(h.occasion || "")}`,
      `Mood: ${titleCase(h.mood || "")}`,
      `Top: ${o.top?.aiName || "Any"}`,
      `Bottom: ${o.bottom?.aiName || "Any"}`,
      `Shoes: ${o.shoes?.aiName || "Any"}`,
      `Score: ${Math.round(o.score || 0)}`,
      "",
      `Why:`,
      ...(o.reason || []),
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(txt);
    alert("Copied ✅");
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              Outfit History ✨
            </h1>
            <p className="text-white/60 mt-3 text-base md:text-lg">
              Your outfit picks, streaks and AI insights.
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

        {/* Stats */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-5">
          <StatCard
            title="Outfits picked"
            value={`${stats.total}`}
            icon={<Hash className="w-5 h-5 text-white/70" />}
            sub="Total saved outfits."
          />
          <StatCard
            title="Average score"
            value={`${stats.avg}`}
            icon={<TrendingUp className="w-5 h-5 text-white/70" />}
            sub="Overall style quality."
          />
          <StatCard
            title="Best occasion"
            value={stats.bestOcc}
            icon={<Trophy className="w-5 h-5 text-white/70" />}
            sub="Most common occasion."
          />
          <StatCard
            title="Best mood"
            value={stats.bestMood}
            icon={<Sparkles className="w-5 h-5 text-white/70" />}
            sub="Most used mood."
          />
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/next-dress"
            className="inline-flex items-center gap-2 rounded-2xl bg-white text-black px-6 py-4 font-extrabold hover:scale-[1.01] transition"
          >
            <Sparkles className="w-5 h-5" />
            Generate Outfit
          </Link>

          <button
            onClick={() => setConfirmClear(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 hover:bg-white/12 px-6 py-4 font-semibold transition"
          >
            <Trash2 className="w-5 h-5" />
            Clear History
          </button>
        </div>

        {/* Filters */}
        <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
          {filterTabs.map((t) => (
            <Pill key={t} text={t} active={filter === t} onClick={() => setFilter(t)} />
          ))}
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="mt-16 text-center text-white/70">
            <p className="text-xl font-semibold">No outfit history yet.</p>
            <p className="text-sm mt-2">Pick an outfit in Next Dress AI to start.</p>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {filteredHistory.map((h, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Glass className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="text-white font-extrabold text-lg">
                        {new Date(h.pickedAt).toLocaleDateString()} •{" "}
                        <span className="text-white/70">
                          {titleCase(h.occasion || "Occasion")}
                        </span>{" "}
                        •{" "}
                        <span className="text-white/70">
                          {titleCase(h.mood || "Mood")}
                        </span>
                      </div>

                      <ScoreBar score={h.outfit?.score || 0} />
                    </div>

                    <button
                      onClick={() => copyShare(h)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 hover:bg-white/12 px-5 py-3 text-sm font-semibold transition"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Share Card
                    </button>
                  </div>

                  {/* outfit images */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    {["top", "bottom", "shoes"].map((k) => {
                      const item: any = (h.outfit as any)?.[k];
                      return (
                        <div
                          key={k}
                          className="rounded-3xl border border-white/10 bg-black/30 overflow-hidden"
                        >
                          <div className="h-[200px] bg-black/60">
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
                          <div className="p-4">
                            <div className="text-xs text-white/40 capitalize">{k}</div>
                            <div className="text-lg font-extrabold">
                              {item?.aiName || "Any"}
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
                  <div className="mt-6 text-sm text-white/70 space-y-2">
                    <p className="font-bold text-white">Why this outfit:</p>
                    {(h?.outfit?.reason || []).slice(0, 5).map((r: string, i: number) => (
                      <p key={i}>• {r}</p>
                    ))}
                  </div>
                </Glass>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm clear modal */}
      <AnimatePresence>
        {confirmClear && (
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
                <h3 className="text-2xl font-extrabold">Clear history?</h3>
                <p className="mt-2 text-sm text-white/60">
                  This will delete all saved outfits. You can’t undo this.
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 rounded-2xl border border-white/12 bg-white/8 hover:bg-white/12 px-5 py-3 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearHistory}
                    className="flex-1 rounded-2xl bg-white text-black px-5 py-3 font-extrabold hover:scale-[1.01] transition"
                  >
                    Clear
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
