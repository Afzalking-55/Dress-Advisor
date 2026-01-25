"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

type WardrobeItem = {
  id: string;
  category: "Top" | "Bottom" | "Shoes" | "Other";
  imageUrl: string;
  createdAt: number;
  name?: string;
};

const fakeAIName = (cat: WardrobeItem["category"]) => {
  if (cat === "Top") return "Stylish Top";
  if (cat === "Bottom") return "Casual Bottom";
  if (cat === "Shoes") return "Classic Shoes";
  return "Fashion Item";
};

export default function AIUploadPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [detected, setDetected] = useState<WardrobeItem["category"][]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // ✅ auth protect
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return router.push("/auth");
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  // handle pick
  const pickFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep(2);

    // ✅ fake AI: guess detection based on filename
    const fname = f.name.toLowerCase();
    const auto: WardrobeItem["category"][] = [];

    if (fname.includes("shirt") || fname.includes("top")) auto.push("Top");
    if (fname.includes("pant") || fname.includes("jean")) auto.push("Bottom");
    if (fname.includes("shoe")) auto.push("Shoes");

    if (auto.length === 0) auto.push("Top", "Bottom"); // default
    setDetected(auto);
  };

  // toggle detection
  const toggleCategory = (cat: WardrobeItem["category"]) => {
    setDetected((prev) =>
      prev.includes(cat) ? prev.filter((x) => x !== cat) : [...prev, cat]
    );
  };

  // save multiple items to wardrobe
  const saveDetectedItems = async () => {
    if (!preview || detected.length === 0) {
      setMsg("Please select at least 1 category.");
      return;
    }

    setSaving(true);
    setMsg("");

    try {
      const existing = localStorage.getItem("wardrobe_items");
      const parsed: WardrobeItem[] = existing ? JSON.parse(existing) : [];

      const now = Date.now();

      const newItems: WardrobeItem[] = detected.map((cat, idx) => ({
        id: (now + idx).toString(),
        category: cat,
        imageUrl: preview,
        createdAt: now,
        name: fakeAIName(cat),
      }));

      localStorage.setItem(
        "wardrobe_items",
        JSON.stringify([...newItems, ...parsed])
      );

      setMsg("✅ AI saved outfits into your wardrobe!");
      setStep(3);

      setTimeout(() => router.push("/wardrobe"), 1200);
    } catch {
      setMsg("❌ Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/60" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-28"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-6xl font-extrabold tracking-wide">
              AI Bed Upload 🛏️✨
            </h1>
            <p className="text-white/70 mt-2">
              Upload 1 photo → AI auto detects multiple clothes & saves them.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition"
          >
            Back
          </Link>
        </div>

        {/* Steps */}
        <div className="mt-10 flex gap-4 text-white/70">
          <span className={step === 1 ? "text-white font-bold" : ""}>
            1) Upload
          </span>
          <span>→</span>
          <span className={step === 2 ? "text-white font-bold" : ""}>
            2) AI Detect
          </span>
          <span>→</span>
          <span className={step === 3 ? "text-white font-bold" : ""}>
            3) Saved ✅
          </span>
        </div>

        {/* Upload Box */}
        <motion.div
          className="mt-10 bg-white/10 border border-white/20 rounded-[2.5rem] p-10 shadow-2xl"
          whileHover={{ scale: 1.01 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Preview */}
            <div>
              <div className="w-full h-80 rounded-3xl bg-black/40 border border-white/20 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-white/50">No image yet</p>
                )}
              </div>

              {/* file picker */}
              <label className="mt-6 block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) pickFile(e.target.files[0]);
                  }}
                />
                <div className="cursor-pointer bg-white text-black py-3 rounded-2xl text-center font-bold hover:scale-[1.02] transition">
                  Choose Bed Outfit Photo
                </div>
              </label>
            </div>

            {/* Detection area */}
            <div>
              <h2 className="text-3xl font-bold">AI Detected</h2>
              <p className="text-white/70 mt-2">
                Select what items are visible in this photo:
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {["Top", "Bottom", "Shoes", "Other"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat as any)}
                    className={`px-6 py-2 rounded-full font-semibold transition ${
                      detected.includes(cat as any)
                        ? "bg-white text-black"
                        : "bg-white/10 border border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={saveDetectedItems}
                disabled={saving}
                className="mt-10 w-full bg-white text-black py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Detected Clothes"}
              </button>

              <AnimatePresence>
                {msg && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-5 text-center text-sm text-white/90 bg-white/10 border border-white/20 p-3 rounded-xl"
                  >
                    {msg}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
