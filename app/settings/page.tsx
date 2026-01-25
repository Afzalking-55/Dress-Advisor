"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Download,
  Upload,
  Trash2,
  Shield,
  Sparkles,
  CheckCircle2,
  Palette,
} from "lucide-react";

import {
  SKIN_TONE_LABELS,
  getSkinToneProfile,
  type Undertone,
} from "../lib/skinToneData";

const STYLE_OPTIONS = [
  "Street",
  "Minimal",
  "Formal",
  "Casual",
  "Old Money",
  "Sporty",
  "Korean",
  "Vintage",
] as const;

const BUDGET_OPTIONS = ["Low", "Medium", "High"] as const;

const COLOR_OPTIONS = [
  "Black",
  "White",
  "Grey",
  "Blue",
  "Red",
  "Green",
  "Brown",
  "Beige",
] as const;

type Strictness = "Relaxed" | "Normal" | "Strict";

function cn(...c: (string | boolean | undefined | null)[]) {
  return c.filter(Boolean).join(" ");
}

/** ✅ Safe LocalStorage Access */
function safeGet(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

function safeRemove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

/** ✅ Safe JSON parse helper */
function safeParse<T>(value: string, fallback: T): T {
  try {
    const parsed = JSON.parse(value);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

/* ---------------- Premium UI Components ---------------- */

function Glass({
  children,
  className = "",
}: {
  children: ReactNode;
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

type ChipProps = {
  text: string;
  active?: boolean;
  onClick: () => void;
  danger?: boolean;
};

function Chip({ text, active, onClick, danger }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-semibold transition border",
        danger
          ? active
            ? "bg-red-500 text-white border-red-500"
            : "bg-white/8 border-white/12 text-white/80 hover:bg-white/12"
          : active
          ? "bg-white text-black border-white shadow-[0_16px_70px_rgba(255,255,255,0.08)]"
          : "bg-white/8 border-white/12 text-white/80 hover:bg-white/12"
      )}
    >
      {text}
    </button>
  );
}

function SectionHeader({
  title,
  sub,
  icon,
}: {
  title: string;
  sub: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {title}
        </h2>
        <p className="text-white/55 text-sm mt-2">{sub}</p>
      </div>
      <div className="w-12 h-12 rounded-2xl border border-white/12 bg-white/8 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function SettingsPage() {
  const [style, setStyle] =
    useState<(typeof STYLE_OPTIONS)[number]>("Casual");
  const [budget, setBudget] =
    useState<(typeof BUDGET_OPTIONS)[number]>("Medium");

  const [favColors, setFavColors] = useState<string[]>(["Black"]);
  const [avoidColors, setAvoidColors] = useState<string[]>([]);
  const [strictness, setStrictness] = useState<Strictness>("Normal");

  // ✅ Skin tone states
  const [skinToneLevel, setSkinToneLevel] = useState<number>(5);
  const [undertone, setUndertone] = useState<Undertone>("Neutral");

  const [toast, setToast] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const raw = safeGet("user_preferences", "");
    if (!raw) return;

    const p = safeParse<any>(raw, null);
    if (!p) return;

    if (p.style) setStyle(p.style);
    if (p.budget) setBudget(p.budget);
    if (Array.isArray(p.favColors)) setFavColors(p.favColors);
    if (Array.isArray(p.avoidColors)) setAvoidColors(p.avoidColors);
    if (p.strictness) setStrictness(p.strictness);

    if (typeof p.skinToneLevel === "number") setSkinToneLevel(p.skinToneLevel);
    if (p.undertone) setUndertone(p.undertone);
  }, []);

  const toggle = (
    arr: string[],
    val: string,
    setter: Dispatch<SetStateAction<string[]>>
  ) => {
    if (arr.includes(val)) setter(arr.filter((x) => x !== val));
    else setter([...arr, val]);
  };

  const save = () => {
    const data = {
      style,
      budget,
      favColors,
      avoidColors,
      strictness,
      skinToneLevel,
      undertone,
    };
    safeSet("user_preferences", JSON.stringify(data));
    setToast("✅ Saved preferences");
    setTimeout(() => setToast(""), 1800);
  };

  const exportData = () => {
    const payload = {
      exportedAt: Date.now(),
      wardrobe_items: safeParse<any[]>(safeGet("wardrobe_items", "[]"), []),
      today_outfit: safeParse<any>(safeGet("today_outfit", "null"), null),
      outfit_history: safeParse<any[]>(safeGet("outfit_history", "[]"), []),
      user_preferences: safeParse<any>(safeGet("user_preferences", "null"), null),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dressai_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setToast("📦 Exported data file");
    setTimeout(() => setToast(""), 1800);
  };

  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      if (json.wardrobe_items)
        safeSet("wardrobe_items", JSON.stringify(json.wardrobe_items));
      if ("today_outfit" in json)
        safeSet("today_outfit", JSON.stringify(json.today_outfit));
      if (json.outfit_history)
        safeSet("outfit_history", JSON.stringify(json.outfit_history));
      if (json.user_preferences)
        safeSet("user_preferences", JSON.stringify(json.user_preferences));

      setToast("✅ Imported successfully");
      setTimeout(() => setToast(""), 1800);

      const p = json.user_preferences;
      if (p?.style) setStyle(p.style);
      if (p?.budget) setBudget(p.budget);
      if (Array.isArray(p?.favColors)) setFavColors(p.favColors);
      if (Array.isArray(p?.avoidColors)) setAvoidColors(p.avoidColors);
      if (p?.strictness) setStrictness(p.strictness);

      if (typeof p?.skinToneLevel === "number") setSkinToneLevel(p.skinToneLevel);
      if (p?.undertone) setUndertone(p.undertone);
    } catch (e) {
      console.log(e);
      setToast("❌ Import failed (invalid file)");
      setTimeout(() => setToast(""), 2200);
    }
  };

  const clearAll = () => {
    safeRemove("wardrobe_items");
    safeRemove("today_outfit");
    safeRemove("outfit_history");
    safeRemove("user_preferences");

    setStyle("Casual");
    setBudget("Medium");
    setFavColors(["Black"]);
    setAvoidColors([]);
    setStrictness("Normal");

    setSkinToneLevel(5);
    setUndertone("Neutral");

    setConfirmClear(false);
    setToast("🧹 Cleared all data");
    setTimeout(() => setToast(""), 2000);
  };

  const summary = useMemo(() => {
    const wardrobe = safeParse<any[]>(safeGet("wardrobe_items", "[]"), []);
    const history = safeParse<any[]>(safeGet("outfit_history", "[]"), []);
    return { wardrobeCount: wardrobe.length, historyCount: history.length };
  }, [toast]);

  const profile = useMemo(
    () => getSkinToneProfile(skinToneLevel, undertone),
    [skinToneLevel, undertone]
  );

  return (
    <main className="min-h-screen relative overflow-hidden text-white pb-28">
      <div className="absolute inset-0 bg-[#06040b]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(236,72,153,0.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(245,158,11,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              Settings ⚙️
            </h1>
            <p className="text-white/60 mt-3 text-base md:text-lg">
              Personalize DressAI and manage your data safely.
            </p>
            <div className="mt-3 text-xs text-white/50">
              Wardrobe items:{" "}
              <span className="text-white/80 font-semibold">
                {summary.wardrobeCount}
              </span>{" "}
              • History:{" "}
              <span className="text-white/80 font-semibold">
                {summary.historyCount}
              </span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 hover:bg-white/12 px-5 py-3 text-sm font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </motion.div>

        <div className="mt-10 space-y-6">
          {/* ✅ Skin Tone Advisor */}
          <Glass className="p-7 md:p-9">
            <SectionHeader
              title="Skin Tone Advisor"
              sub="Pick your tone — DressAI will recommend premium colors that suit you best."
              icon={<Palette className="w-5 h-5 text-white/70" />}
            />

            <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-[24px] border border-white/10 bg-black/30 p-6">
                <div className="text-xs text-white/60 font-semibold tracking-widest uppercase">
                  Skin tone level
                </div>
                <div className="mt-2 text-2xl font-extrabold">
                  {profile.level}/10 — {profile.label}
                </div>

                <input
                  type="range"
                  min={1}
                  max={10}
                  value={skinToneLevel}
                  onChange={(e) => setSkinToneLevel(Number(e.target.value))}
                  className="mt-6 w-full accent-white"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  {SKIN_TONE_LABELS.map((x) => (
                    <button
                      key={x.level}
                      type="button"
                      onClick={() => setSkinToneLevel(x.level)}
                      className={cn(
                        "px-3 py-2 rounded-full text-xs font-semibold border transition",
                        skinToneLevel === x.level
                          ? "bg-white text-black border-white"
                          : "bg-white/8 border-white/12 text-white/75 hover:bg-white/12"
                      )}
                    >
                      {x.level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/30 p-6">
                <div className="text-xs text-white/60 font-semibold tracking-widest uppercase">
                  Undertone
                </div>
                <div className="mt-2 text-sm text-white/60">
                  Warm / Cool / Neutral undertone improves recommendation accuracy.
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(["Warm", "Neutral", "Cool"] as Undertone[]).map((u) => (
                    <Chip
                      key={u}
                      text={u}
                      onClick={() => setUndertone(u)}
                      active={undertone === u}
                    />
                  ))}
                </div>

                <div className="mt-7">
                  <div className="text-sm font-extrabold text-white">
                    Best metals
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.metals.map((m) => (
                      <span
                        key={m}
                        className="px-3 py-2 rounded-full text-xs font-semibold border border-white/10 bg-white/6 text-white/80"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-[24px] border border-white/10 bg-black/30 p-6">
                <div className="font-extrabold text-white">Best colors ✅</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.bestColors.slice(0, 10).map((c) => (
                    <span
                      key={c}
                      className="px-3 py-2 rounded-full text-xs font-semibold border border-white/10 bg-white/6 text-white/85"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/30 p-6">
                <div className="font-extrabold text-white">Avoid ❌</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.avoidColors.slice(0, 8).map((c) => (
                    <span
                      key={c}
                      className="px-3 py-2 rounded-full text-xs font-semibold border border-red-500/25 bg-red-500/10 text-red-100/90"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-[24px] border border-white/10 bg-black/30 p-6">
              <div className="font-extrabold text-white">
                Outfit palette suggestions ✨
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {profile.palettes.map((p) => (
                  <div
                    key={p.name}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="text-sm font-extrabold">{p.name}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.colors.map((c) => (
                        <span
                          key={c}
                          className="px-3 py-2 rounded-full text-[11px] font-semibold border border-white/10 bg-white/6 text-white/80"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Glass>

          {/* Rest of your settings */}
          <Glass className="p-7 md:p-9">
            <SectionHeader
              title="Style Type"
              sub="Helps AI match your vibe and recommend better outfits."
              icon={<Sparkles className="w-5 h-5 text-white/70" />}
            />
            <div className="flex flex-wrap gap-2 mt-6">
              {STYLE_OPTIONS.map((s) => (
                <Chip
                  key={s}
                  text={s}
                  onClick={() => setStyle(s)}
                  active={style === s}
                />
              ))}
            </div>
          </Glass>

          <Glass className="p-7 md:p-9">
            <SectionHeader
              title="Budget Level"
              sub="Influences outfit choices and shopping suggestions."
              icon={<CheckCircle2 className="w-5 h-5 text-white/70" />}
            />
            <div className="flex flex-wrap gap-2 mt-6">
              {BUDGET_OPTIONS.map((b) => (
                <Chip
                  key={b}
                  text={b}
                  onClick={() => setBudget(b)}
                  active={budget === b}
                />
              ))}
            </div>
          </Glass>

          <Glass className="p-7 md:p-9">
            <SectionHeader
              title="Color Preferences"
              sub="Choose what you like and what you want to avoid."
              icon={<Shield className="w-5 h-5 text-white/70" />}
            />

            <div className="mt-7">
              <div className="text-sm font-extrabold text-white/85">
                Favorite Colors
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {COLOR_OPTIONS.map((c) => (
                  <Chip
                    key={c}
                    text={c}
                    onClick={() => toggle(favColors, c, setFavColors)}
                    active={favColors.includes(c)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="text-sm font-extrabold text-white/85">
                Avoid Colors
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {COLOR_OPTIONS.map((c) => (
                  <Chip
                    key={c}
                    text={c}
                    danger
                    onClick={() => toggle(avoidColors, c, setAvoidColors)}
                    active={avoidColors.includes(c)}
                  />
                ))}
              </div>
            </div>
          </Glass>

          <Glass className="p-7 md:p-9">
            <SectionHeader
              title="Office Strictness"
              sub="Controls how strictly DressAI avoids casual fits for office."
              icon={<Shield className="w-5 h-5 text-white/70" />}
            />
            <div className="flex flex-wrap gap-2 mt-6">
              {(["Relaxed", "Normal", "Strict"] as Strictness[]).map((s) => (
                <Chip
                  key={s}
                  text={String(s)}
                  onClick={() => setStrictness(s)}
                  active={strictness === s}
                />
              ))}
            </div>
          </Glass>

          <Glass className="p-7 md:p-9">
            <SectionHeader
              title="Data & Privacy"
              sub="Export or import your wardrobe safely. No server needed."
              icon={<Download className="w-5 h-5 text-white/70" />}
            />

            <div className="mt-6 flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={exportData}
                className="flex-1 rounded-2xl bg-white text-black py-4 font-extrabold hover:scale-[1.01] transition inline-flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export Data
              </button>

              <label className="flex-1">
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) importData(f);
                  }}
                />
                <div className="cursor-pointer rounded-2xl border border-white/12 bg-white/8 hover:bg-white/12 py-4 font-semibold transition inline-flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import Data
                </div>
              </label>
            </div>

            <div className="mt-5 text-xs text-white/50">
              Export gives you a JSON file containing wardrobe + history +
              preferences.
            </div>
          </Glass>

          <button
            type="button"
            onClick={save}
            className="w-full rounded-[22px] bg-white text-black py-4 font-extrabold text-lg hover:scale-[1.01] transition inline-flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>

          <Glass className="p-7 md:p-9 border border-red-500/25">
            <SectionHeader
              title="Danger Zone"
              sub="Clear all local data. Cannot be undone."
              icon={<Trash2 className="w-5 h-5 text-red-200/80" />}
            />
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="mt-6 w-full rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 py-4 font-extrabold transition inline-flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Clear All Data
            </button>
          </Glass>

          <AnimatePresence>
            {!!toast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[999] px-6"
              >
                <div className="rounded-full border border-white/12 bg-black/60 backdrop-blur-xl px-5 py-3 text-sm font-semibold text-white/90 shadow-[0_20px_100px_rgba(0,0,0,0.6)]">
                  {toast}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
                <h3 className="text-2xl font-extrabold">Clear all data?</h3>
                <p className="mt-2 text-sm text-white/60">
                  This deletes wardrobe, today outfit, history, and preferences.
                  You can’t undo this.
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 rounded-2xl border border-white/12 bg-white/8 hover:bg-white/12 px-5 py-3 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
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
