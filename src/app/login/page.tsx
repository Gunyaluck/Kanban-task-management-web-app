"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import ThemeSwitch from "@/components/ui/ThemeSwitch";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const DEMO_EMAIL = "testuser@gmail.com";
const DEMO_PASSWORD = "12345678";

const inputClassName =
  "w-full rounded border border-token bg-(--color-surface) px-4 py-3 text-sm font-medium text-(--color-text) placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>(
    { email: false, password: false }
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailError =
    !email.trim()
      ? "Email is required."
      : !isValidEmail(email.trim())
        ? "Please enter a valid email address."
        : null;
  const passwordError = !password ? "Password is required." : null;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setTouched({ email: true, password: true });

    if (emailError || passwordError) {
      return;
    }
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/boards");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setTouched({ email: false, password: false });
    setError(null);
    setNotice("Demo account filled. You can sign in now.");
  };

  const copyToClipboard = async (value: string, label: string) => {
    setError(null);
    setNotice(null);
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied.`);
    } catch {
      setError("Copy failed. Please copy manually.");
    }
  };

  return (
    <main className="min-h-screen bg-(--color-bg) px-4 py-10 text-(--color-text) flex flex-col items-center gap-6">
      <div className="mx-auto w-full max-w-[480px] ">
        <div className="flex items-center justify-center gap-3 pb-10">
          <img
            src="/logos/logo-mobile.svg"
            alt="Kanban logo"
            className="h-7 w-auto"
          />
          <span className="text-2xl font-bold tracking-[-0.5px]">kanban</span>
        </div>

        <div className="surface rounded-lg p-6">
          <h1 className="text-lg font-bold leading-6">Login</h1>
          <p className="text-muted mt-2 text-sm font-medium leading-[23px]">
            Welcome back. Sign in to continue.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4 ">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-muted text-xs font-bold">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() =>
                  setTouched((t) => ({ ...t, email: true }))
                }
                placeholder="e.g. you@company.com"
                className={inputClassName}
                autoComplete="email"
              />
              {touched.email && emailError ? (
                <p className="text-(--color-danger) text-sm font-medium">
                  {emailError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-muted text-xs font-bold">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() =>
                    setTouched((t) => ({ ...t, password: true }))
                  }
                  placeholder="••••••••"
                  className={`${inputClassName} pr-12`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="text-muted absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <img
                    src={
                      showPassword
                        ? "/icons/icon-eye-off.svg"
                        : "/icons/icon-eye.svg"
                    }
                    alt={showPassword ? "Hide password" : "Show password"}
                    width={18}
                    height={16}
                    className="h-4 w-[18px] hover:cursor-pointer"
                  />
                </button>
              </div>
              {touched.password && passwordError ? (
                <p className="text-(--color-danger) text-sm font-medium">
                  {passwordError}
                </p>
              ) : null}
            </div>

            <div className="mt-2 rounded-lg border border-token bg-(--color-bg) p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold">Demo account</p>
                  <p className="text-muted mt-1 text-xs font-medium leading-5">
                    Use this account to explore the app quickly.
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs btn w-[150px] h-[36px] btn-secondary hover:cursor-pointer whitespace-nowrap"
                  onClick={fillDemo}
                >
                  Use demo
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="w-[400px] flex items-center justify-between gap-3 rounded-md border border-token bg-(--color-surface) px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-muted text-[11px] font-bold uppercase tracking-[0.6px]">
                      Email
                    </p>
                    <p className="truncate text-sm font-medium">{DEMO_EMAIL}</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs w-[150px] h-[36px] btn btn-secondary hover:cursor-pointer"
                    onClick={() => copyToClipboard(DEMO_EMAIL, "Email")}
                  >
                    Copy
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-md border border-token bg-(--color-surface) px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-muted text-[11px] font-bold uppercase tracking-[0.6px]">
                      Password
                    </p>
                    <p className="truncate text-sm font-medium">
                      {showPassword ? DEMO_PASSWORD : "••••••••"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs btn w-[150px] h-[36px] btn-secondary hover:cursor-pointer"
                    onClick={() => copyToClipboard(DEMO_PASSWORD, "Password")}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {notice ? (
              <p className="text-(--color-primary) text-sm font-medium">
                {notice}
              </p>
            ) : null}

            {error ? (
              <p className="text-(--color-danger) text-sm font-medium">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="btn btn-l btn-primary hover:btn-primary-hover w-full mx-auto hover:cursor-pointer"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-muted text-sm font-medium">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="text-(--color-primary) font-bold hover:underline"
              >
                Create one
              </a>
            </p>
          </form>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="w-full">
          <ThemeSwitch />
        </div>
      </div>
    </main>
  );
}