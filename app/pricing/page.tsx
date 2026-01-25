"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Crown,
  Shield,
  Flame,
  ArrowRight,
  Check,
  X,
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

function CheckRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/70">
      {ok ? (
        <Check className="w-4 h-4 text-white/80" />
      ) : (
        <X className="w-4 h-4 text-white/40" />
      )}
      <span className={ok ? "text-white/80" : "text-white/40"}>{text}</span>
    </div>
  );
}

export default function PricingPage() {
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
              <p className="text-xs text-white/50 -mt-1">Pricing</p>
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
            <Pill text="Premium subscription ready • Monetization built-in" />
          </div>

          <h1 className="mt-8 text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Pricing designed for
            <br />
            <span className="bg-gradient-to-r from-fuchsia-200 via-white to-amber-200 bg-clip-text text-transparent">
              a real startup.
            </span>
          </h1>

          <p className="mt-7 text-lg md:text-xl text-white/65 max-w-3xl mx-auto leading-relaxed">
            Buyers pay more when they see monetization.
            These plans make Dress Advisor look like a complete SaaS product.
          </p>
        </motion.div>

        {/* PLANS */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.20 }}
          className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* FREE */}
          <Glass className="p-8">
            <p className="text-white/65 text-sm font-semibold">FREE</p>
            <h3 className="mt-2 text-3xl font-extrabold">Starter</h3>
            <p className="mt-3 text-white/60 text-sm leading-relaxed">
              For anyone trying DressAI.
            </p>

            <div className="mt-6 text-5xl font-extrabold">
              $0<span className="text-white/40 text-lg font-semibold">/mo</span>
            </div>

            <div className="mt-7 space-y-3">
              <CheckRow ok text="Upload & manage wardrobe" />
              <CheckRow ok text="Basic outfit assistant" />
              <CheckRow ok text="Today outfit + streak" />
              <CheckRow ok={false} text="Outfit history (100 picks)" />
              <CheckRow ok={false} text="Premium scoring engine" />
              <CheckRow ok={false} text="Export wardrobe data" />
            </div>

            <Link
              href="/auth"
              className="mt-8 inline-flex w-full justify-center rounded-[22px] border border-white/12 bg-white/8 hover:bg-white/12 py-4 font-extrabold transition"
            >
              Start Free
            </Link>
          </Glass>

          {/* PRO */}
          <Glass className="p-8 border-white/25">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sm font-extrabold">
              <Crown className="w-4 h-4" />
              MOST POPULAR
            </div>

            <p className="text-white/65 text-sm font-semibold mt-5">PRO</p>
            <h3 className="mt-2 text-3xl font-extrabold">Premium Stylist</h3>
            <p className="mt-3 text-white/60 text-sm leading-relaxed">
              Best for daily outfit users.
            </p>

            <div className="mt-6 text-5xl font-extrabold">
              $9<span className="text-white/40 text-lg font-semibold">/mo</span>
            </div>

            <div className="mt-7 space-y-3">
              <CheckRow ok text="Unlimited wardrobe items" />
              <CheckRow ok text="Premium mood + occasion scoring" />
              <CheckRow ok text="Outfit history (100 picks)" />
              <CheckRow ok text="Share outfit card" />
              <CheckRow ok text="Better recommendations" />
              <CheckRow ok={false} text="Team / multi-user dashboard" />
            </div>

            <Link
              href="/auth"
              className="mt-8 inline-flex w-full justify-center rounded-[22px] bg-white text-black py-4 font-extrabold hover:scale-[1.02] transition"
            >
              Upgrade to Pro <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <p className="text-center text-xs text-white/50 mt-4">
              Cancel anytime. No hidden fees.
            </p>
          </Glass>

          {/* BUSINESS */}
          <Glass className="p-8">
            <p className="text-white/65 text-sm font-semibold">BUSINESS</p>
            <h3 className="mt-2 text-3xl font-extrabold">Team / Brand</h3>
            <p className="mt-3 text-white/60 text-sm leading-relaxed">
              For fashion startups & styling teams.
            </p>

            <div className="mt-6 text-5xl font-extrabold">
              $49<span className="text-white/40 text-lg font-semibold">/mo</span>
            </div>

            <div className="mt-7 space-y-3">
              <CheckRow ok text="All Pro features" />
              <CheckRow ok text="Export wardrobe & history data" />
              <CheckRow ok text="Brand style presets" />
              <CheckRow ok text="Multi-user dashboards" />
              <CheckRow ok text="Priority support" />
              <CheckRow ok text="Commercial license" />
            </div>

            <Link
              href="/auth"
              className="mt-8 inline-flex w-full justify-center rounded-[22px] border border-white/12 bg-white/8 hover:bg-white/12 py-4 font-extrabold transition"
            >
              Contact Sales
            </Link>
          </Glass>
        </motion.div>

        {/* TRUST */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.35 }}
          className="mt-16"
        >
          <Glass className="p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <Shield className="w-7 h-7 text-white/80" />
                <div>
                  <p className="font-extrabold text-lg">Startup monetization</p>
                  <p className="text-white/55 text-sm mt-1">
                    Pricing structure increases product valuation instantly.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Flame className="w-7 h-7 text-white/80" />
                <div>
                  <p className="font-extrabold text-lg">Sell-ready</p>
                  <p className="text-white/55 text-sm mt-1">
                    Buyers pay more for products with business model clarity.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Sparkles className="w-7 h-7 text-white/80" />
                <div>
                  <p className="font-extrabold text-lg">Premium positioning</p>
                  <p className="text-white/55 text-sm mt-1">
                    Looks like a real SaaS brand, not a student project.
                  </p>
                </div>
              </div>
            </div>
          </Glass>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.45 }}
          className="mt-20"
        >
          <Glass className="p-10 md:p-14 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Ready to upgrade your style?
            </h2>
            <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
              Start free, then upgrade anytime.
            </p>

            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="px-10 py-4 rounded-[22px] bg-white text-black font-extrabold text-lg hover:scale-[1.03] transition inline-flex items-center justify-center gap-2"
              >
                Start free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/demo"
                className="px-10 py-4 rounded-[22px] border border-white/12 bg-white/8 hover:bg-white/12 font-extrabold text-lg transition inline-flex items-center justify-center gap-2"
              >
                View demo <Sparkles className="w-5 h-5" />
              </Link>
            </div>
          </Glass>
        </motion.div>

        {/* Footer */}
        <div className="mt-20 border-t border-white/10 pt-10 text-center text-white/50 text-sm">
          <p className="font-semibold text-white/70">Dress Advisor</p>
          <p className="mt-2">Pricing • Monetization ready</p>
          <p className="mt-4">© {new Date().getFullYear()} Dress Advisor.</p>
        </div>
      </div>
    </main>
  );
}
