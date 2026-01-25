"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

export default function AuthPage() {
  const router = useRouter();
  const [emailMode, setEmailMode] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const googleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (e: any) {
      alert(e?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const emailLogin = async () => {
    try {
      setLoading(true);
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (e: any) {
      alert(e?.message || "Email login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-center tracking-wide">
          Dress Advisor
        </h1>
        <p className="text-center text-white/70 mt-2 mb-8">
          Login in 1 click using Gmail
        </p>

        <button
          onClick={googleLogin}
          disabled={loading}
          className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Continue with Google"}
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => setEmailMode((p) => !p)}
            className="text-white/70 underline text-sm"
          >
            {emailMode ? "Hide Email Login" : "Use Email Instead"}
          </button>
        </div>

        {emailMode && (
          <div className="mt-6 space-y-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 outline-none placeholder:text-white/50"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 outline-none placeholder:text-white/50"
            />

            <button
              onClick={emailLogin}
              disabled={loading || !email || !password}
              className="w-full bg-white/90 text-black py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
            >
              {mode === "login" ? "Login" : "Create Account"}
            </button>

            <div className="text-center text-sm text-white/70">
              {mode === "login" ? (
                <>
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="underline text-white"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="underline text-white"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link href="/" className="text-sm text-white/70 underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
