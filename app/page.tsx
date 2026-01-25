"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Shirt,
  Upload,
  CheckCircle2,
  ArrowRight,
  Shield,
  Crown,
  Flame,
} from "lucide-react";

function cn(...c: (string | boolean | undefined | null)[]) {
  return c.filter(Boolean).join(" ");
}

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
        "shadow-[0_18px_90px_rgba(0,0,0,0.55)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(236,72,153,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(245,158,11,0.08),transparent_65%)]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/75 text-sm font-semibold">
      <Sparkles className="w-4 h-4 opacity-80" />
      {text}
    </span>
  );
}

function FeatureCard({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <Glass className="p-7 hover:scale-[1.01] transition will-change-transform">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold">{title}</h3>
          <p className="text-white/60 mt-2 leading-relaxed">{text}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl border border-white/12 bg-white/6 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Glass>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen w-full relative overflow-hidden text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[#06040b]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(236,72,153,0.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(245,158,11,0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-black/40" />

      {/* floating glows */}
      <div className="pointer-events-none absolute -top-52 left-1/4 h-[520px] w-[520px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-0 h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-28">
        {/* NAV */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl border border-white/12 bg-white/6 flex items-center justify-center font-extrabold">
              DA
            </div>
            <div>
              <p className="font-extrabold tracking-tight text-lg">
                Dress Advisor
              </p>
              <p className="text-xs text-white/50 -mt-1">
                Wardrobe Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="px-5 py-2 rounded-full border border-white/12 bg-white/6 hover:bg-white/10 font-semibold transition"
            >
              Login
            </Link>

            <Link
              href="/auth"
              className="px-5 py-2 rounded-full bg-white text-black font-extrabold hover:scale-[1.03] transition"
            >
              Get Started
            </Link>
          </div>
        </motion.div>

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.05 }}
          className="text-center mt-16"
        >
          <div className="flex justify-center">
            <Pill text="AI Fashion Assistant • Built from your wardrobe" />
          </div>

          <h1 className="mt-8 text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Look Expensive.
            <br />
            Dress Smart.
            <br />
            <span className="bg-gradient-to-r from-fuchsia-200 via-white to-amber-200 bg-clip-text text-transparent">
              Every single day.
            </span>
          </h1>

          <p className="mt-7 text-lg md:text-xl text-white/65 max-w-3xl mx-auto leading-relaxed">
            Dress Advisor turns your wardrobe into an AI stylist. Upload outfits,
            get intelligent naming + occasion tags, then generate outfit combos
            with reasoning, mood + color logic.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-[22px] bg-white text-black font-extrabold text-lg hover:scale-[1.03] transition"
            >
              Try DressAI Now <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/next-dress"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-[22px] border border-white/12 bg-white/6 hover:bg-white/10 font-extrabold text-lg transition"
            >
              Open Outfit Assistant <Sparkles className="w-5 h-5" />
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-7 flex flex-wrap gap-3 justify-center text-xs text-white/60">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10">
              ✅ Fast & private
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10">
              ✅ No paid API required
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10">
              ✅ Built on Next.js
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10">
              ✅ Works with wardrobe memory
            </span>
          </div>
        </motion.div>

        {/* VALUE STRIP */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
          className="mt-16"
        >
          <Glass className="p-7 md:p-9">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <Crown className="w-7 h-7 text-white/80" />
                <div>
                  <p className="font-extrabold text-lg">Premium style logic</p>
                  <p className="text-white/55 text-sm mt-1">
                    Mood + occasion + formality score.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Shield className="w-7 h-7 text-white/80" />
                <div>
                  <p className="font-extrabold text-lg">Privacy-first</p>
                  <p className="text-white/55 text-sm mt-1">
                    Export & import wardrobe anytime.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Flame className="w-7 h-7 text-white/80" />
                <div>
                  <p className="font-extrabold text-lg">Daily streak habit</p>
                  <p className="text-white/55 text-sm mt-1">
                    Build consistency in style.
                  </p>
                </div>
              </div>
            </div>
          </Glass>
        </motion.div>

        {/* FEATURES */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.32 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <FeatureCard
            title="AI Clothing Naming"
            text="Upload clothing photos — DressAI generates clean fashion names and tags."
            icon={<Upload className="w-5 h-5 text-white/80" />}
          />
          <FeatureCard
            title="Wardrobe Intelligence"
            text="Your wardrobe becomes structured: category, colors, seasons and context."
            icon={<Shirt className="w-5 h-5 text-white/80" />}
          />
          <FeatureCard
            title="Outfit Recommendations"
            text="Generate outfit combos from your wardrobe using simple smart scoring."
            icon={<CheckCircle2 className="w-5 h-5 text-white/80" />}
          />
          <FeatureCard
            title="Chat-style UX"
            text="Feels like talking to a stylist instead of clicking templates."
            icon={<Sparkles className="w-5 h-5 text-white/80" />}
          />
        </motion.div>

        {/* FINAL CTA */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.45 }}
          className="mt-20"
        >
          <Glass className="p-9 md:p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Ready to build a wardrobe that thinks?
            </h2>
            <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
              Upload your first outfit and see DressAI recommend combos instantly.
            </p>

            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="px-10 py-4 rounded-[22px] bg-white text-black font-extrabold text-lg hover:scale-[1.03] transition inline-flex items-center justify-center gap-2"
              >
                Start free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard"
                className="px-10 py-4 rounded-[22px] border border-white/12 bg-white/6 hover:bg-white/10 font-extrabold text-lg transition inline-flex items-center justify-center gap-2"
              >
                Open dashboard <Sparkles className="w-5 h-5" />
              </Link>
            </div>
          </Glass>
        </motion.div>

        {/* FOOTER */}
        <div className="mt-20 border-t border-white/10 pt-10 text-center text-white/50 text-sm">
          <p className="font-semibold text-white/70">Dress Advisor</p>
          <p className="mt-2">AI wardrobe intelligence • Built with Next.js</p>
          <p className="mt-4">
            © {new Date().getFullYear()} Dress Advisor. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
