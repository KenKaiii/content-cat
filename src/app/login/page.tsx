"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      // Redirect to home page on success
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a]">
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
                  className="h-[42px] w-full rounded-xl border border-transparent bg-[#1a1a1a] px-4 text-sm font-medium text-zinc-300 transition placeholder:text-zinc-500 hover:border-white/20 focus:border-zinc-600 focus:bg-[#0a0a0a] focus:outline-none"
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
                  className="h-[42px] w-full rounded-xl border border-transparent bg-[#1a1a1a] px-4 text-sm font-medium text-zinc-300 transition placeholder:text-zinc-500 hover:border-white/20 focus:border-zinc-600 focus:bg-[#0a0a0a] focus:outline-none"
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
                className="inline-grid h-12 w-full max-w-full cursor-pointer content-center items-center justify-center overflow-hidden rounded-xl border border-transparent bg-[#e8e8e8] text-sm font-medium text-ellipsis whitespace-nowrap text-[#131313] ring-transparent transition hover:bg-[#d4d4d4] focus:outline-none focus-visible:ring-2 disabled:cursor-wait disabled:bg-[#2a2a2a] disabled:text-zinc-600"
                type="submit"
                value={isLoading ? "Logging in..." : "Log in"}
              />
            </fieldset>
          </form>

          {/* Links */}
          <div className="mt-4 flex justify-between text-zinc-500">
            <Link
              className="inline-grid grid-flow-col content-center gap-1.5 overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap transition hover:brightness-75"
              href="/"
            >
              ← Back
            </Link>
            <button
              type="button"
              className="inline-grid grid-flow-col content-center gap-1.5 overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap transition hover:brightness-75"
              onClick={() => alert("Contact admin to reset password")}
            >
              Forgot Password
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
