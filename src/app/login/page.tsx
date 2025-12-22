"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  // Get redirect destination from query params
  const redirectTo = searchParams.get("from") || "/";

  // Check if setup is needed - redirect if no users exist
  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch("/api/auth/setup");
        const data = await res.json();
        if (data.setupRequired) {
          router.replace("/setup");
          return;
        }
      } catch {
        // If check fails, show login anyway
      }
      setCheckingSetup(false);
    }
    checkSetup();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        return;
      }

      // Redirect to original page or home on success
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col">
      {/* Navbar - logo only */}
      <header className="flex items-center px-6 py-4">
        <Link href="/" className="font-heading gradient-shift text-xl">
          Content Cat
        </Link>
      </header>

      {/* Main content - vertically centered */}
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md px-4">
          {/* Title */}
          <div className="mb-8 flex w-full flex-col text-center">
            <h1 className="text-xl font-semibold text-white">
              Log in to Content Cat
            </h1>
          </div>

          {/* Form */}
          <form noValidate onSubmit={handleSubmit} className="w-full">
            <fieldset
              disabled={isLoading}
              className="relative flex w-full flex-col gap-4 disabled:animate-pulse disabled:cursor-wait"
            >
              {/* Error message */}
              {error && (
                <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
                  {error}
                </div>
              )}

              {/* Email input */}
              <div className="grid w-full">
                <input
                  className="h-[42px] w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm font-medium text-white transition placeholder:text-zinc-400 hover:border-white/30 focus:border-pink-400/50 focus:bg-black/60 focus:outline-none backdrop-blur-sm"
                  placeholder="Email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  autoComplete="email"
                />
              </div>

              {/* Password input */}
              <div className="grid w-full">
                <input
                  className="h-[42px] w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm font-medium text-white transition placeholder:text-zinc-400 hover:border-white/30 focus:border-pink-400/50 focus:bg-black/60 focus:outline-none backdrop-blur-sm"
                  placeholder="Password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  autoComplete="current-password"
                />
              </div>

              {/* Submit button */}
              <input
                className="inline-grid h-12 w-full max-w-full cursor-pointer content-center items-center justify-center overflow-hidden rounded-xl border border-transparent bg-[#e8e8e8] text-sm font-medium text-ellipsis whitespace-nowrap text-[#131313] ring-transparent transition hover:bg-[#d4d4d4] focus:outline-none focus-visible:ring-2 disabled:cursor-wait disabled:bg-zinc-700 disabled:text-zinc-400"
                type="submit"
                value={isLoading ? "Logging in..." : "Log in"}
              />
            </fieldset>
          </form>

          {/* Links */}
          <div className="mt-4 flex justify-between text-zinc-300">
            <Link
              className="inline-grid grid-flow-col content-center gap-1.5 overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap transition hover:brightness-75"
              href="/"
            >
              ← Back
            </Link>
            <button
              type="button"
              className="inline-grid grid-flow-col content-center gap-1.5 overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap transition hover:brightness-75"
              onClick={() =>
                alert(
                  "To reset your password, run this command in the Content Cat directory:\n\npnpm reset-password"
                )
              }
            >
              Forgot Password
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-zinc-400">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
