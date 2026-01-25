"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

// ✅ Correct import path (NO @app)
import { auth } from "@/app/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");

    try {
      if (!email || !pass) {
        setErr("Email and password required");
        return;
      }

      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        await createUserWithEmailAndPassword(auth, email, pass);
      }

      router.push("/next-dress");
    } catch (e: any) {
      setErr(e?.message || "Auth failed");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#07050d] text-white px-6">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-white/60 mt-2 text-sm">
          DressAI login connected to Firebase ✅
        </p>

        <div className="mt-6 space-y-3">
          <input
            className="w-full rounded-2xl px-4 py-3 bg-black/30 border border-white/10 outline-none focus:border-white/30"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-2xl px-4 py-3 bg-black/30 border border-white/10 outline-none focus:border-white/30"
            placeholder="Password"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          {err && (
            <div className="text-red-400 text-sm border border-red-500/20 bg-red-500/10 rounded-xl px-4 py-2">
              {err}
            </div>
          )}

          <button
            onClick={submit}
            className="w-full mt-2 rounded-2xl bg-white text-black font-extrabold py-3 hover:scale-[1.01] transition"
          >
            {mode === "login" ? "Login" : "Sign up"}
          </button>

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full text-white/70 text-sm underline mt-4"
          >
            {mode === "login"
              ? "New here? Create account"
              : "Already have account? Login"}
          </button>
        </div>
      </div>
    </main>
  );
}
