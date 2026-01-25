"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { addWardrobeItem } from "../lib/db";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Upload,
  Camera,
  Images,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Save,
  SlidersHorizontal,
  Tag,
  Palette,
  Shirt,
  Footprints,
} from "lucide-react";

/* -------------------- Types -------------------- */

type WardrobeCategory = "Top" | "Bottom" | "Shoes" | "Other";

type QueueItem = {
  queueId: string;
  file: File;
  preview: string;

  // AI outputs
  category: WardrobeCategory;
  clothType: string;
  colorName: string;
  aiName: string;
  occasions: string[];
  avoidOccasions: string[];
  confidence: number; // 0..100

  aiLoading: boolean;
  error?: string;
};

type DetectedAI = {
  clothType?: string;
  category?: WardrobeCategory;
  bestOccasions?: string[];
  avoidOccasions?: string[];
  confidence?: number; // 0..1
};

/* -------------------- Consts -------------------- */

const OCCASION_OPTIONS = [
  "College",
  "Casual",
  "Office",
  "Party",
  "Date",
  "Wedding",
  "Meeting",
];

/* -------------------- utils -------------------- */

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

function trustLabel(conf: number) {
  if (conf >= 75) return { label: "High", note: "AI is sure ✅" };
  if (conf >= 45) return { label: "Medium", note: "Verify quickly ⚠️" };
  if (conf > 0) return { label: "Low", note: "Fix manually ❌" };
  return { label: "—", note: "" };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
  });
}

/** ✅ compress huge mobile images */
async function compressImage(file: File, maxW = 1200, quality = 0.82) {
  if (typeof window === "undefined") return file;

  const img = new Image();
  img.crossOrigin = "anonymous";
  const blobUrl = URL.createObjectURL(file);

  return new Promise<File>((resolve) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(blobUrl);
        return resolve(file);
      }

      const ratio = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(blobUrl);
          if (!blob) return resolve(file);
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      resolve(file);
    };

    img.src = blobUrl;
  });
}

async function detectDominantRGB(
  file: File
): Promise<{ r: number; g: number; b: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve({ r: 0, g: 0, b: 0 });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      for (let i = 0; i < data.length; i += 60) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      resolve({
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
      });
    };

    img.src = URL.createObjectURL(file);
  });
}

function rgbToColorName(r: number, g: number, b: number): string {
  if (r < 60 && g < 60 && b < 60) return "Black";
  if (r > 215 && g > 215 && b > 215) return "White";

  const rg = Math.abs(r - g);
  const gb = Math.abs(g - b);
  const rb = Math.abs(r - b);

  if (rg < 18 && gb < 18 && rb < 18) {
    if (r > 185) return "Light Grey";
    if (r > 130) return "Grey";
    if (r > 90) return "Dark Grey";
    return "Charcoal";
  }

  if (b > r && b > g) return "Blue";
  if (r > g && r > b) return "Red";
  if (g > r && g > b) return "Green";

  if (r > 160 && g > 120 && b < 90) return "Brown";
  if (r > 200 && g > 180 && b < 140) return "Beige";

  if (r > 180 && b > 140 && g < 120) return "Purple";
  if (r > 210 && g > 120 && b < 80) return "Orange";

  return "Dark";
}

async function detectAI(imageBase64: string): Promise<DetectedAI> {
  const res = await fetch("/api/detect-clothing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "AI failed");
  return data as DetectedAI;
}

/* -------------------- UI -------------------- */

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

function Chip({
  text,
  active,
  disabled,
  onClick,
}: {
  text: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition border",
        disabled
          ? "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
          : active
          ? "bg-white text-black border-white"
          : "bg-white/8 border-white/12 text-white/80 hover:bg-white/12"
      )}
    >
      {text}
    </button>
  );
}

/* -------------------- Page -------------------- */

export default function SetupPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [savingAll, setSavingAll] = useState(false);
  const [toast, setToast] = useState("");

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

  const total = queue.length;
  const done = queue.filter((x) => !x.aiLoading && x.confidence > 0).length;
  const low = queue.filter((x) => x.confidence > 0 && x.confidence < 45).length;

  const queueStats = useMemo(() => {
    const tops = queue.filter((x) => x.category === "Top").length;
    const bottoms = queue.filter((x) => x.category === "Bottom").length;
    const shoes = queue.filter((x) => x.category === "Shoes").length;
    return { tops, bottoms, shoes };
  }, [queue]);

  /** ✅ Add file(s) into queue and auto-run detection */
  const enqueueFiles = async (files: File[]) => {
    if (!files?.length) return;

    const capped = files.slice(0, 50); // safety cap
    const newItems: QueueItem[] = [];

    for (const rawFile of capped) {
      const f = await compressImage(rawFile);
      const preview = await fileToBase64(f);

      const { r, g, b } = await detectDominantRGB(f);
      const niceColor = rgbToColorName(r, g, b);

      const queueId = crypto.randomUUID();

      newItems.push({
        queueId,
        file: f,
        preview,

        category: "Other",
        clothType: "outfit",
        colorName: niceColor,
        aiName: `${niceColor} Outfit`,
        occasions: [],
        avoidOccasions: [],
        confidence: 0,

        aiLoading: true,
      });
    }

    setQueue((prev) => [...newItems, ...prev]);

    // run detection async sequential (stable)
    for (const it of newItems) {
      await runAIForItem(it.queueId);
    }
  };

  const runAIForItem = async (queueId: string) => {
    setQueue((prev) =>
      prev.map((x) =>
        x.queueId === queueId ? { ...x, aiLoading: true, error: undefined } : x
      )
    );

    try {
      const item = queue.find((x) => x.queueId === queueId);
      if (!item) return;

      // simulate thinking bar
      setQueue((prev) =>
        prev.map((x) =>
          x.queueId === queueId ? { ...x, confidence: 18 } : x
        )
      );

      const data = await detectAI(item.preview);

      const niceType = titleCase(data?.clothType || "outfit");
      const pct =
        typeof data.confidence === "number"
          ? Math.round(Math.max(0, Math.min(1, data.confidence)) * 100)
          : 90;

      setQueue((prev) =>
        prev.map((x) => {
          if (x.queueId !== queueId) return x;
          return {
            ...x,
            clothType: data?.clothType || x.clothType,
            category: data?.category || x.category,
            occasions: Array.isArray(data.bestOccasions) ? data.bestOccasions : x.occasions,
            avoidOccasions: Array.isArray(data.avoidOccasions) ? data.avoidOccasions : x.avoidOccasions,
            aiName: `${x.colorName} ${niceType}`.trim(),
            confidence: pct,
            aiLoading: false,
          };
        })
      );
    } catch (e: any) {
      setQueue((prev) =>
        prev.map((x) =>
          x.queueId === queueId
            ? {
                ...x,
                aiLoading: false,
                confidence: 32,
                error: "AI failed — please edit manually",
              }
            : x
        )
      );
    }
  };

  const removeItem = (queueId: string) => {
    setQueue((prev) => prev.filter((x) => x.queueId !== queueId));
  };

  const toggleOccasion = (queueId: string, tag: string) => {
    setQueue((prev) =>
      prev.map((x) => {
        if (x.queueId !== queueId) return x;
        const active = x.occasions.includes(tag);
        return {
          ...x,
          occasions: active
            ? x.occasions.filter((t) => t !== tag)
            : [...x.occasions, tag],
        };
      })
    );
  };

  const setCategory = (queueId: string, cat: WardrobeCategory) => {
    setQueue((prev) =>
      prev.map((x) => (x.queueId === queueId ? { ...x, category: cat } : x))
    );
  };

  const setClothType = (queueId: string, v: string) => {
    setQueue((prev) =>
      prev.map((x) => (x.queueId === queueId ? { ...x, clothType: v } : x))
    );
  };

  const saveAll = async () => {
    if (!user) return;
    if (queue.length === 0) return;

    // must have 1 occasion to save
    const invalid = queue.find((x) => x.occasions.length === 0);
    if (invalid) {
      setToast("❌ Some items have no occasion selected. Fix and Save All again.");
      setTimeout(() => setToast(""), 2400);
      return;
    }

    setSavingAll(true);

    try {
      for (const x of queue) {
        const item = {
          id: crypto.randomUUID(),
          category: x.category,
          imageUrl: x.preview,
          createdAt: Date.now(),
          colorName: x.colorName,
          aiName: x.aiName,
          occasions: x.occasions,
          clothType: x.clothType,
          avoidOccasions: x.avoidOccasions,
          confidence: x.confidence,
        };
        await addWardrobeItem(user.uid, item as any);
      }

      setToast("✅ Saved everything to wardrobe!");
      setTimeout(() => {
        router.push("/wardrobe");
      }, 850);
    } catch (e) {
      console.log(e);
      setToast("❌ Save failed. Try again.");
      setTimeout(() => setToast(""), 2200);
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden text-white pb-28">
      {/* BG */}
      <div className="absolute inset-0 bg-[#06040b]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(236,72,153,0.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(245,158,11,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              Wardrobe Setup ⚡
            </h1>
            <p className="text-white/60 mt-3 text-base md:text-lg max-w-2xl">
              Upload your wardrobe in bulk. DressAI detects everything, and you
              save all in one click.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/12 bg-white/8 text-white/80">
                <Sparkles className="w-4 h-4 opacity-75" />
                {done}/{total} analyzed
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/12 bg-white/8 text-white/80">
                <Shirt className="w-4 h-4 opacity-75" /> Tops {queueStats.tops}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/12 bg-white/8 text-white/80">
                <Tag className="w-4 h-4 opacity-75" /> Bottoms {queueStats.bottoms}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/12 bg-white/8 text-white/80">
                <Footprints className="w-4 h-4 opacity-75" /> Shoes {queueStats.shoes}
              </div>

              {low > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/12 bg-white/8 text-white/80">
                  <AlertTriangle className="w-4 h-4 opacity-75" /> Low confidence {low}
                </div>
              )}
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

        {/* Hidden inputs */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.currentTarget.value = "";
            enqueueFiles(files);
          }}
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.currentTarget.value = "";
            enqueueFiles(files);
          }}
        />

        {/* Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="rounded-2xl border border-white/12 bg-white/8 hover:bg-white/12 py-4 font-extrabold transition inline-flex items-center justify-center gap-2"
          >
            <Images className="w-5 h-5" />
            Bulk from Gallery
          </button>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-2xl bg-white text-black py-4 font-extrabold hover:scale-[1.01] transition inline-flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Capture (Queue)
          </button>

          <button
            type="button"
            disabled={savingAll || queue.length === 0}
            onClick={saveAll}
            className="rounded-2xl border border-white/12 bg-black/30 hover:bg-black/40 py-4 font-extrabold transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {savingAll ? "Saving..." : "Save All"}
          </button>
        </div>

        {/* Queue */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-32">
          {queue.length === 0 ? (
            <Glass className="p-10 lg:col-span-2 text-center">
              <p className="text-white/80 text-lg font-semibold">
                No items in queue yet.
              </p>
              <p className="text-white/50 mt-2 text-sm">
                Upload from gallery (bulk) or capture photos to build your wardrobe fast.
              </p>
            </Glass>
          ) : (
            queue.map((x) => {
              const trust = trustLabel(x.confidence);
              const lowConfidence = x.confidence > 0 && x.confidence < 45;

              return (
                <motion.div
                  key={x.queueId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Glass className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-2xl border border-white/10 bg-black/50 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={x.preview}
                          alt="item"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-extrabold">
                              {x.aiName}
                            </div>
                            <div className="text-sm text-white/55 mt-1">
                              {x.category} • {x.colorName} • {titleCase(x.clothType)}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <div
                                className={cn(
                                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border",
                                  lowConfidence
                                    ? "border-white/12 bg-white/8 text-white/80"
                                    : "border-white/12 bg-white/8 text-white/80"
                                )}
                              >
                                {lowConfidence ? (
                                  <AlertTriangle className="w-4 h-4 opacity-75" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 opacity-75" />
                                )}
                                {trust.label} • {x.confidence}%
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(x.queueId)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 hover:bg-white/12 px-4 py-2 text-xs font-semibold transition"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>

                        {/* AI Loading bar */}
                        <AnimatePresence>
                          {x.aiLoading && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="mt-4 rounded-2xl border border-white/12 bg-white/8 p-4"
                            >
                              <div className="flex items-center justify-between text-sm font-semibold">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4" />
                                  Analyzing...
                                </div>
                                <div className="text-xs text-white/55 animate-pulse">
                                  thinking
                                </div>
                              </div>

                              <div className="mt-3 h-2 w-full bg-black/30 rounded-full overflow-hidden border border-white/10">
                                <motion.div
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${x.confidence}%` }}
                                  transition={{ duration: 0.3 }}
                                  className="h-full bg-gradient-to-r from-fuchsia-400 via-purple-400 to-amber-300"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Manual fix only if low confidence */}
                        {lowConfidence && (
                          <div className="mt-4 rounded-2xl border border-white/12 bg-black/30 p-4">
                            <div className="flex items-center justify-between">
                              <div className="font-extrabold text-white">
                                Manual fix
                              </div>
                              <SlidersHorizontal className="w-4 h-4 opacity-70" />
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {(["Top", "Bottom", "Shoes", "Other"] as const).map(
                                (c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => setCategory(x.queueId, c)}
                                    className={cn(
                                      "rounded-2xl border px-3 py-2 text-xs font-semibold transition",
                                      x.category === c
                                        ? "bg-white text-black border-white"
                                        : "bg-white/8 border-white/12 text-white/80 hover:bg-white/12"
                                    )}
                                  >
                                    {c}
                                  </button>
                                )
                              )}
                            </div>

                            <div className="mt-3">
                              <label className="text-xs text-white/55">
                                Cloth type
                              </label>
                              <input
                                value={x.clothType}
                                onChange={(e) =>
                                  setClothType(x.queueId, e.target.value)
                                }
                                className="mt-2 w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-2 text-sm text-white outline-none"
                                placeholder="eg: tshirt, jeans"
                              />
                            </div>
                          </div>
                        )}

                        {/* Occasions */}
                        <div className="mt-4">
                          <div className="text-xs text-white/55 font-semibold">
                            Select occasions (required)
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {OCCASION_OPTIONS.map((tag) => {
                              const active = x.occasions.includes(tag);
                              const avoided = x.avoidOccasions.includes(tag);

                              return (
                                <Chip
                                  key={tag}
                                  text={tag}
                                  active={active}
                                  disabled={avoided}
                                  onClick={() => toggleOccasion(x.queueId, tag)}
                                />
                              );
                            })}
                          </div>

                          {x.avoidOccasions.length > 0 && (
                            <div className="mt-2 text-xs text-white/50">
                              ❌ Avoid: {x.avoidOccasions.join(", ")}
                            </div>
                          )}

                          {x.error && (
                            <div className="mt-2 text-xs text-white/60">
                              ⚠️ {x.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Glass>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Toast */}
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

      <BottomNav />
    </main>
  );
}
