"use client";

import { useEffect, useRef, useState } from "react";
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { generateAIOutfits } from "../lib/outfitBrain";
import type { WardrobeItem, Outfit } from "../lib/outfitBrain";

/* helpers */

const OCCASIONS = [
  "College","Casual","Office","Interview","Party","Date","Wedding",
  "Gym","Travel","Dinner","Night Out"
];

const MOODS = ["Clean","Bold","Street","Minimal","Confident","Sexy"];

function cn(...c: any[]) {
  return c.filter(Boolean).join(" ");
}

function normalize(s: string) {
  return (s || "").trim().toLowerCase();
}

/* UI */

function Glass({ children }: any) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,.7)]">
      {children}
    </div>
  );
}

function Chip({ text, onClick, active }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-bold border",
        active
          ? "bg-white text-black"
          : "bg-white/8 border-white/12 text-white/70 hover:bg-white/12"
      )}
    >
      {text}
    </button>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score);
  return (
    <div className="mt-2">
      <div className="text-xs text-white/60 flex justify-between">
        <span>Style score</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 mt-1 bg-black/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-fuchsia-400 to-amber-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* PAGE */

export default function NextDressPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [occasion, setOccasion] = useState("");
  const [mood, setMood] = useState("");
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [picked, setPicked] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* Load wardrobe ONLY in browser */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = JSON.parse(localStorage.getItem("wardrobe_items") || "[]");
    setWardrobe(raw.filter((x: any) => x.imageUrl));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [outfits, picked]);

  async function generate(occ: string, moodText: string) {
    const res = await generateAIOutfits({
      occasion: occ,
      mood: moodText,
      wardrobe,
    });

    setOutfits(res);
    setPicked(null);
  }

  // 🔥 UPDATED PICK FUNCTION (NOW TALKS TO BACKEND)
  async function pick(o: Outfit, idx: number) {
    setPicked(idx);

    const payload = {
      user_id: "local",
      pickedAt: Date.now(),
      occasion,
      mood,
      outfit: o,
    };

    // local save
    localStorage.setItem("today_outfit", JSON.stringify(payload));

    const hist = JSON.parse(localStorage.getItem("outfit_history") || "[]");
    hist.unshift(payload);
    localStorage.setItem("outfit_history", JSON.stringify(hist.slice(0, 50)));

    // send to backend AI memory
    try {
      await fetch("http://127.0.0.1:8001/confirm-outfit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("✅ Outfit sent to AI memory");
    } catch (err) {
      console.error("❌ Feedback failed", err);
    }
  }

  function reset() {
    setStep(1);
    setOccasion("");
    setMood("");
    setOutfits([]);
    setPicked(null);
  }

  return (
    <main className="min-h-screen text-white pb-28">
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Glass className="min-h-[80vh] flex flex-col">

          <div className="p-6 border-b border-white/10">
            <h1 className="text-3xl font-extrabold">DressAI ✨</h1>

            <div className="mt-4 flex gap-2 overflow-x-auto">
              {step === 1 &&
                OCCASIONS.map((o) => (
                  <Chip
                    key={o}
                    text={o}
                    onClick={() => {
                      setOccasion(normalize(o));
                      setStep(2);
                    }}
                  />
                ))}

              {step === 2 &&
                MOODS.map((m) => (
                  <Chip
                    key={m}
                    text={m}
                    onClick={() => {
                      setMood(normalize(m));
                      setStep(3);
                      generate(occasion, normalize(m));
                    }}
                  />
                ))}

              {step === 3 && (
                <>
                  <Chip text="♻️ Regenerate" onClick={() => generate(occasion, mood)} active />
                  <Chip text="Today" onClick={() => router.push("/today")} />
                  <Chip text="Reset" onClick={reset} />
                </>
              )}
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <AnimatePresence>
              {outfits.map((o, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-[24px] border bg-black/40 overflow-hidden",
                    idx === 0 ? "border-fuchsia-400" : "border-white/10"
                  )}
                >
                  <div className="p-5">
                    <ScoreBar score={o.score} />

                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {[o.top, o.bottom, o.shoes].map((it, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-white/10">
                          {it?.imageUrl && (
                            <img src={it.imageUrl} className="h-28 w-full object-cover" />
                          )}
                          <div className="p-2 text-xs text-white/70">
                            {it?.aiName || "Any"}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => pick(o, idx)}
                      className="mt-4 w-full bg-white text-black py-3 rounded-xl font-extrabold flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Pick this outfit
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        </Glass>
      </div>

      <BottomNav />
    </main>
  );
}
