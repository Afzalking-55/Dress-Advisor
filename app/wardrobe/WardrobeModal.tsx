import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function WardrobeModal({ selected, setSelected }: any) {
  if (!selected) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSelected(null)}
    >
      <motion.div
        initial={{ scale: 0.97 }}
        animate={{ scale: 1 }}
        className="relative rounded-[28px] overflow-hidden border border-white/10 bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={selected.imageUrl}
          className="max-h-[80vh] object-cover"
        />

        <button
          onClick={() => setSelected(null)}
          className="absolute top-4 right-4 w-10 h-10 rounded-xl
          border border-white/12 bg-black/50 backdrop-blur-xl
          flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </motion.div>
    </motion.div>
  );
}
