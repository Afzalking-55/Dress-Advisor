"use client";

import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import Link from "next/link";

function Section({
  title,
  items,
  onSelect,
  hint,
}: {
  title: string;
  items: any[];
  onSelect: (x: any) => void;
  hint: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-extrabold tracking-wide">
          {title} <span className="text-white/40">({items.length})</span>
        </h2>

        {items.length < 2 && (
          <span className="text-xs text-white/50">{hint}</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="border border-white/10 rounded-2xl p-6 bg-white/5 text-white/60 text-sm">
          No {title.toLowerCase()} yet — upload for better outfits.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((it) => (
            <motion.button
              key={it.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 250 }}
              onClick={() => onSelect(it)}
              className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 hover:border-white/30"
            >
              <div className="h-[170px]">
                {/* eslint-disable-next-line */}
                <img
                  src={it.imageUrl}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>

              <div className="p-3 text-left">
                <div className="font-bold truncate text-sm">
                  {it.aiName || "Item"}
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {it.colorName || "—"}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WardrobeGrid({
  items,
  loading,
  setSelected,
}: {
  items: any[];
  loading: boolean;
  setSelected: (x: any) => void;
}) {
  if (loading)
    return (
      <div className="text-white/60 p-10 text-center">Loading wardrobe…</div>
    );

  const tops = items.filter((i) => i.category === "Top");
  const bottoms = items.filter((i) => i.category === "Bottom");
  const shoes = items.filter((i) => i.category === "Shoes");
  const other = items.filter((i) => i.category === "Other");

  const lowInventory =
    tops.length < 2 || bottoms.length < 2 || shoes.length < 1;

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-40 space-y-14">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold">Your Wardrobe</h1>

        <Link
          href="/upload"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-extrabold hover:scale-[1.03] transition"
        >
          <Plus className="w-4 h-4" />
          Upload
        </Link>
      </div>

      {/* AI Guidance */}
      {lowInventory && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <div className="flex items-center gap-2 font-bold text-white mb-2">
            <Sparkles className="w-4 h-4" />
            Improve AI outfit quality
          </div>

          <ul className="space-y-1 text-white/60">
            <li>• Add at least 2 Tops</li>
            <li>• Add 2 Bottoms</li>
            <li>• Shoes improve accuracy by ~40%</li>
          </ul>

          <Link
            href="/upload"
            className="inline-block mt-4 rounded-full bg-white text-black px-6 py-2 font-bold hover:scale-[1.02] transition"
          >
            Upload now
          </Link>
        </div>
      )}

      <Section
        title="Tops"
        items={tops}
        onSelect={setSelected}
        hint="2+ tops recommended"
      />

      <Section
        title="Bottoms"
        items={bottoms}
        onSelect={setSelected}
        hint="Balance your fits"
      />

      <Section
        title="Shoes"
        items={shoes}
        onSelect={setSelected}
        hint="Shoes boost AI score"
      />

      {other.length > 0 && (
        <Section
          title="Other"
          items={other}
          onSelect={setSelected}
          hint=""
        />
      )}
    </div>
  );
}
