"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Shield,
  Crown,
  ArrowRight,
  CheckCircle2,
  LineChart,
  Users,
  Wand2,
  Globe,
  Zap,
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

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Glass className="p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-white/55 font-semibold">
            {label}
          </p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight">
            {value}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl border border-white/12 bg-white/8 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Glass>
  );
}

function Point({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 text-white/75 text-sm leading-relaxed">
      <CheckCircle2 className="w-5 h-5 mt-0.5 text-white/70 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full relative overflow-hidden text-white">
      {/* ROYAL GALAXY BACKGROUND */}
      <div className="absolute inset-0 bg-[#06040b]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.22),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(236,72,153,0.16),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(245,158,11,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-black/40" />

      {/* glows */}
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
              <p className="text-xs text-white/50 -mt-1">About</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="px-5 py-2 rounded-full border border-white/12 bg-white/8 hover:bg-white/12 font-semibold transition"
            >
              Demo
            </Link>
            <Link
              href="/pricing"
              className="px-5 py-2 rounded-full border border-white/12 bg-white/8 hover:bg-white/12 font-semibold transition"
            >
              Pricing
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
          transition={{ duration: 0.8, delay: 0.05 }}
          className="text-center mt-16"
        >
          <div className="flex justify-center">
            <Pill text="Built like a real product • Acquisition-ready" />
          </div>

          <h1 className="mt-8 text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Dress Advisor is an
            <br />
            <span className="bg-gradient-to-r from-fuchsia-200 via-white to-amber-200 bg-clip-text text-transparent">
              AI wardrobe assistant
            </span>
            <br />
            for real daily use.
          </h1>

          <p className="mt-7 text-lg md:text-xl text-white/65 max-w-4xl mx-auto leading-relaxed">
            Not a random outfit generator.
            Dress Advisor builds wardrobe memory, understands occasion + mood,
            and recommends outfits with reasoning — like a personal stylist
            inside your phone.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="px-10 py-4 rounded-[22px] bg-white text-black font-extrabold text-lg hover:scale-[1.03] transition inline-flex items-center justify-center gap-2"
            >
              View live demo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/next-dress"
              className="px-10 py-4 rounded-[22px] border border-white/12 bg-white/8 hover:bg-white/12 font-extrabold text-lg transition inline-flex items-center justify-center gap-2"
            >
              Try assistant <Sparkles className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* STATS */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Stat
            label="Product Type"
            value="SaaS"
            icon={<Crown className="w-6 h-6 text-white/80" />}
          />
          <Stat
            label="Core Feature"
            value="Wardrobe AI"
            icon={<Wand2 className="w-6 h-6 text-white/80" />}
          />
          <Stat
            label="Market"
            value="Global"
            icon={<Globe className="w-6 h-6 text-white/80" />}
          />
        </motion.div>

        {/* WHY IT MATTERS */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Glass className="p-9 md:p-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Why this product matters
            </h2>
            <p className="text-white/60 mt-4 leading-relaxed">
              Clothing decisions happen daily. Most people waste time choosing,
              repeat the same outfits, and buy wrong clothes.
              Dress Advisor fixes this using wardrobe intelligence.
            </p>

            <div className="mt-7 space-y-3">
              <Point text="Users upload their real wardrobe items (memory system)." />
              <Point text="AI detects clothing type + occasions automatically." />
              <Point text="Occasion + mood scoring builds outfit recommendations." />
              <Point text="Habit engine: Today outfit + streak system." />
            </div>
          </Glass>

          <Glass className="p-9 md:p-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Why companies buy it
            </h2>
            <p className="text-white/60 mt-4 leading-relaxed">
              This is not just a UI.
              It’s a ready-made fashion product with monetization pages,
              product flow, and extensible AI.
            </p>

            <div className="mt-7 space-y-3">
              <Point text="Instantly integrates into fashion / styling startups." />
              <Point text="Perfect base for e-commerce personalization." />
              <Point text="Can become paid app: Pro plan + Business plan ready." />
              <Point text="Strong UX: looks premium and sellable in US/UK market." />
            </div>
          </Glass>
        </motion.div>

        {/* ROADMAP */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-16"
        >
          <Glass className="p-9 md:p-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Built to scale into a real AI fashion company
            </h2>
            <p className="text-white/60 mt-4 leading-relaxed max-w-3xl">
              The current AI system is designed to evolve.
              A buyer can turn Dress Advisor into true “trained fashion AI”
              by collecting real user outfit choices and building dataset loops.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-[26px] border border-white/10 bg-black/30 p-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-white/80" />
                  <p className="font-extrabold text-xl">Phase 1</p>
                </div>
                <p className="text-white/60 mt-3 text-sm">
                  MVP + premium UX + wardrobe system + monetization pages.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/30 p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-white/80" />
                  <p className="font-extrabold text-xl">Phase 2</p>
                </div>
                <p className="text-white/60 mt-3 text-sm">
                  User growth loop: outfit history dataset, feedback buttons,
                  personalization scoring.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/30 p-6">
                <div className="flex items-center gap-3">
                  <LineChart className="w-6 h-6 text-white/80" />
                  <p className="font-extrabold text-xl">Phase 3</p>
                </div>
                <p className="text-white/60 mt-3 text-sm">
                  Train/fine-tune fashion models, commercial partnerships,
                  brand integrations.
                </p>
              </div>
            </div>
          </Glass>
        </motion.div>

        {/* FINAL CTA */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-20"
        >
          <Glass className="p-10 md:p-14 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Dress Advisor is ready for acquisition.
            </h2>
            <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
              A full product flow. Premium UI. Monetization pages. Expandable AI.
              Exactly what a buyer wants.
            </p>

            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="px-10 py-4 rounded-[22px] bg-white text-black font-extrabold text-lg hover:scale-[1.03] transition inline-flex items-center justify-center gap-2"
              >
                View pricing <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/demo"
                className="px-10 py-4 rounded-[22px] border border-white/12 bg-white/8 hover:bg-white/12 font-extrabold text-lg transition inline-flex items-center justify-center gap-2"
              >
                View demo <Sparkles className="w-5 h-5" />
              </Link>
            </div>

            <div className="mt-6 text-xs text-white/45">
              Built with Next.js + Firebase. Designed for US/UK market.
            </div>
          </Glass>
        </motion.div>

        {/* Footer */}
        <div className="mt-20 border-t border-white/10 pt-10 text-center text-white/50 text-sm">
          <p className="font-semibold text-white/70">Dress Advisor</p>
          <p className="mt-2">About • Brand positioning</p>
          <p className="mt-4">© {new Date().getFullYear()} Dress Advisor.</p>
        </div>
      </div>
    </main>
  );
}
