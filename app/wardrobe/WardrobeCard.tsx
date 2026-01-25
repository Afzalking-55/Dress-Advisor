import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function WardrobeCard({ item, onOpen, onDelete }: any) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="group relative overflow-hidden rounded-[26px]
      border border-white/10 bg-white/[0.04] backdrop-blur-xl
      shadow-[0_18px_90px_rgba(0,0,0,0.6)]"
    >
      {/* image */}
      <button onClick={onOpen} className="block w-full text-left">
        <div className="relative h-[260px] overflow-hidden">
          <img
            src={item.imageUrl}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.06]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>
      </button>

      {/* content */}
      <div className="p-5">
        <h2 className="text-lg font-extrabold text-white truncate">
          {item.aiName || "Item"}
        </h2>

        <p className="text-sm text-white/55 mt-1">
          {item.category}
        </p>

        <div className="mt-4 flex gap-3">
          <button
            onClick={onDelete}
            className="flex-1 inline-flex items-center justify-center gap-2
            rounded-full border border-white/12 bg-white/8 hover:bg-white/12
            px-4 py-2 text-sm font-semibold transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}
