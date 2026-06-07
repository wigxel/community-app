"use client";

import { useState } from "react";
import SignInForm from "./sign-in-form";
import SignUpForm from "./sign-up-form";

export default function AuthForm({
  redirectTo,
  defaultMode,
}: {
  redirectTo: string;
  defaultMode: "sign-in" | "sign-up";
}) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">(defaultMode);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex mb-6 rounded-xl overflow-hidden border border-white/10">
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === "sign-in"
                ? "bg-blue-500 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === "sign-up"
                ? "bg-blue-500 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
          {mode === "sign-in" ? (
            <SignInForm redirectTo={redirectTo} />
          ) : (
            <SignUpForm redirectTo={redirectTo} />
          )}
        </div>
      </div>
    </div>
  );
}
