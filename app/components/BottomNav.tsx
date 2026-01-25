"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Shirt,
  Upload,
  Sparkles,
  CheckCircle2,
  History,
  Settings,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/next-dress", label: "Dress AI", icon: Sparkles },
  { href: "/today", label: "Today", icon: CheckCircle2 },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function BottomNav() {
  const pathname = usePathname();

  const activeIndex = items.findIndex((it) => {
    return pathname === it.href || pathname.startsWith(it.href + "/");
  });

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[min(760px,94vw)]">
      <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-black/40 backdrop-blur-2xl shadow-[0_34px_140px_rgba(0,0,0,0.80)] px-3 py-3">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_45%)]" />

        {activeIndex >= 0 && (
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="absolute top-3 bottom-3"
            style={{
              left: `calc(${(100 / items.length) * activeIndex}% + 6px)`,
              width: `calc(${100 / items.length}% - 12px)`,
            }}
          >
            <div className="h-full w-full rounded-[26px] bg-white/10 border border-white/12 shadow-[0_18px_70px_rgba(0,0,0,0.65)]" />
            <div className="pointer-events-none absolute inset-x-6 -bottom-[2px] h-[2px] bg-gradient-to-r from-transparent via-fuchsia-300/70 to-transparent" />
          </motion.div>
        )}

        <div className="relative flex items-center justify-between gap-2">
          {items.map((it) => {
            const active =
              pathname === it.href || pathname.startsWith(it.href + "/");
            const Icon = it.icon;

            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "group relative flex flex-1 items-center justify-center",
                  "rounded-[26px] px-4 py-3 transition",
                  "hover:bg-white/5"
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ y: -2 }}
                  className="flex flex-col items-center gap-1"
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition",
                      active
                        ? "text-white"
                        : "text-white/65 group-hover:text-white/90"
                    )}
                  />

                  <span
                    className={cn(
                      "text-[11px] font-semibold tracking-wide transition",
                      active ? "text-white/90" : "text-white/45",
                      "hidden sm:block"
                    )}
                  >
                    {it.label}
                  </span>

                  {active && (
                    <span className="text-[10px] font-semibold tracking-wide text-white/85 sm:hidden">
                      {it.label}
                    </span>
                  )}
                </motion.div>

                {active && (
                  <div className="absolute -top-[6px] w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.35)]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
