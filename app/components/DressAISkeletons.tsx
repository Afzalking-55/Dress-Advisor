"use client";

import { motion } from "framer-motion";

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-white/10 rounded-xl ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

export function OutfitCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
      <Shimmer className="h-4 w-32" />
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <Shimmer key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-3/4" />
      <div className="flex gap-2 pt-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Shimmer key={i} className="w-8 h-8 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function OutfitGridSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-8"
    >
      {[0, 1, 2].map((i) => (
        <OutfitCardSkeleton key={i} />
      ))}
    </motion.div>
  );
}
