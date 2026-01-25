"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Upload,
  Shirt,
  CheckCircle2,
  ArrowRight,
  Crown,
  Shield,
  Flame,
  PlayCircle,
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
        "relative overflow-hidden rounded-[30px]",
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

function Pill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/8 text-white/75 text-sm font-semibold">
      <Sparkles className="w-4 h-4 opacity-80" />
      {text}
    </span>
  );
}

function DemoCard({
  title,
  text,
  icon,
  href,
  cta,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
  href: string;
  cta: string;
}) {
  return (
    <Glass className="p-7 hover:scale-[1.01] transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold">{title}</h3>
          <p className="text-white/60 mt-2 leading-relaxed">{text}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl border border-white/12 bg-white/8 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 font-extrabold hover:scale-[1.02] transition"
      >
        {cta} <ArrowRight className="w-4 h-4" />
      </Link>
    </Glass>
  );
}

export default function DemoPage() {
  return (
    <main className="min-h-screen w-full relative overflow-hidden text-white">
      {/* ROYAL GALAXY BACKGROUND */}
      <div className="absolute inset-0 bg-[#06040b]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.22),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(236,72,153,0.16),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(245,158,11,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-black/40" />

      {/* floating glows */}
      <div className="pointer-events-none absolute -top-52 left-1/4 h-[520px] w-[520px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-0 h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-28">
        {/* NAV */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl border border-white/12 bg-white/8 flex items-center justify-center font-extrabold">
              DA
            </div>
            <div>
              <p className="font-extrabold tracking-tight text-lg">
                Dress Advisor
              </p>
              <p className="text-xs text-white/50 -mt-1">Product Demo</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="px-5 py-2 rounded-full border border-white/12 bg-white/8 hover:bg-white/12 font-semibold transition"
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
        </div>

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.05 }}
          className="text-center mt-16"
        >
          <div className="flex justify-center">
            <Pill text="Live Demo • AI Wardrobe Assistant" />
          </div>

          <h1 className="mt-8 text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Watch DressAI
            <br />
            <span className="bg-gradient-to-r from-fuchsia-200 via-white to-amber-200 bg-clip-text text-transparent">
              Style You Instantly.
            </span>
          </h1>

          <p className="mt-7 text-lg md:text-xl text-white/65 max-w-3xl mx-auto leading-relaxed">
            This demo shows the full workflow:
            upload clothing → wardrobe memory → AI outfit recommendations.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/next-dress"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-[22px] bg-white text-black font-extrabold text-lg hover:scale-[1.03] transition"
            >
              Try Live Demo <PlayCircle className="w-6 h-6" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-[22px] border border-white/12 bg-white/8 hover:bg-white/12 font-extrabold text-lg transition"
            >
              Open Dashboard <Sparkles className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* DEMO FLOW */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.25 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <DemoCard
            title="1) Upload clothing"
            text="Upload outfit photos. AI detects cloth type, category, and best occasions automatically."
            icon={<Upload className="w-5 h-5 text-white/80" />}
            href="/upload"
            cta="Upload Outfit"
          />

          <DemoCard
            title="2) Wardrobe memory"
            text="Items are saved into your wardrobe with smart tags like color + occasions."
            icon={<Shirt className="w-5 h-5 text-white/80" />}
            href="/wardrobe"
            cta="Open Wardrobe"
          />

          <DemoCard
            title="3) Outfit assistant"
            text="Pick occasion + mood. DressAI generates outfit combos using scoring and reasoning."
            icon={<CheckCircle2 className="w-5 h-5 text-white/80" />}
            href="/next-dress"
            cta="Open Assistant"
          />
        </motion.div>

        {/* TRUST STRIP */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-16"
        >
          <Glass className="p-7 md:p-9">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <Crown className="w-7 h-7 text-white/80" />
                <div>
                  <p className="font-extrabold text-lg">Premium UX</p>
                  <p className="text-white/55 text-sm mt-1">
                    Apple-like UI, not a basic dashboard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Shield className="w-7 h-7 text-white/80" />
                <div>
                  <p className="font-extrabold text-lg">Smart logic</p>
                  <p className="text-white/55 text-sm mt-1">
                    Occasion + mood scoring + color harmony.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Flame className="w-7 h-7 text-white/80" />
                <div>
                  <p className="font-extrabold text-lg">Habit engine</p>
                  <p className="text-white/55 text-sm mt-1">
                    Today outfit + streak system built-in.
                  </p>
                </div>
              </div>
            </div>
          </Glass>
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
              Want to see real outfit recommendations?
            </h2>
            <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
              Add a few wardrobe items and try the assistant. It works best after
              8+ items.
            </p>

            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/upload"
                className="px-10 py-4 rounded-[22px] bg-white text-black font-extrabold text-lg hover:scale-[1.03] transition inline-flex items-center justify-center gap-2"
              >
                Upload wardrobe <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/next-dress"
                className="px-10 py-4 rounded-[22px] border border-white/12 bg-white/8 hover:bg-white/12 font-extrabold text-lg transition inline-flex items-center justify-center gap-2"
              >
                Open assistant <Sparkles className="w-5 h-5" />
              </Link>
            </div>
          </Glass>
        </motion.div>

        {/* FOOTER */}
        <div className="mt-20 border-t border-white/10 pt-10 text-center text-white/50 text-sm">
          <p className="font-semibold text-white/70">Dress Advisor</p>
          <p className="mt-2">AI wardrobe assistant demo • Next.js + Firebase</p>
          <p className="mt-4">© {new Date().getFullYear()} Dress Advisor.</p>
        </div>
      </div>
    </main>
  );
}
