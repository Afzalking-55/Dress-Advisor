"use client";

import BottomNav from "../components/BottomNav";
import { useWardrobe } from "./useWardrobe";
import WardrobeGrid from "./WardrobeGrid";
import WardrobeModal from "./WardrobeModal";
import DeleteModal from "./DeleteModal";

export default function WardrobePage() {
  const wardrobe = useWardrobe();

  return (
    <main className="min-h-screen relative overflow-hidden text-white">
      {/* Category Segmentation */}
      <div className="sticky top-0 z-30 bg-black/70 backdrop-blur-xl px-5 pt-5">
        <div className="flex gap-3 overflow-x-auto pb-3">
          {(["All", "Top", "Bottom", "Shoes"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => wardrobe.setFilter(cat)}
              className={[
                "shrink-0 px-5 py-2 rounded-full text-sm font-extrabold border transition",
                wardrobe.filter === cat
                  ? "bg-white text-black border-white"
                  : "bg-white/8 border-white/12 text-white/70 hover:bg-white/12",
              ].join(" ")}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <WardrobeGrid {...wardrobe} />
      <WardrobeModal {...wardrobe} />
      <DeleteModal {...wardrobe} />

      <BottomNav />
    </main>
  );
}
