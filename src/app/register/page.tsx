"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import ThemeSwitch from "@/components/ui/ThemeSwitch";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClassName =
  "w-full rounded border border-token bg-(--color-surface) px-4 py-3 text-sm font-medium text-(--color-text) placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>(
    { email: false, password: false }
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailError =
    !email.trim()
      ? "Email is required."
      : !isValidEmail(email.trim())
        ? "Please enter a valid email address."
        : null;
  const passwordError =
    !password
      ? "Password is required."
      : password.length < 8
        ? "Password must be at least 8 characters."
        : null;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setTouched({ email: true, password: true });

    if (emailError || passwordError) {
      return;
    }
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(error.message);
        return;
      }

      if (data.user?.id) {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            id: data.user.id,
            email: email.trim(),
            name: name.trim() || null,
          }),
        });
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          setError(
            payload?.error ||
              "We couldn't create your profile in the database. Please try again."
          );
          return;
        }
      }
      setSuccess("Account created. Check your email to confirm, then login.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-(--color-bg) px-4 py-10 text-(--color-text) flex flex-col items-center gap-6">
      <div className="mx-auto w-full max-w-[480px]">
        <div className="flex items-center justify-center gap-3 pb-10">
          <img
            src="/logos/logo-mobile.svg"
            alt="Kanban logo"
            className="h-7 w-auto"
          />
          <span className="text-2xl font-bold tracking-[-0.5px]">kanban</span>
        </div>

        <div className="surface rounded-lg p-6">
          <h1 className="text-lg font-bold leading-6">Register</h1>
          <p className="text-muted mt-2 text-sm font-medium leading-[23px]">
            Create an account to start managing your boards.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-muted text-xs font-bold">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className={inputClassName}
                autoComplete="name"
              />
            </div>
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
                  placeholder="Create a strong password"
                  className={`${inputClassName} pr-12`}
                  autoComplete="new-password"
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
                    className="h-4 w-[18px]"
                  />
                </button>
              </div>
              {touched.password && passwordError ? (
                <p className="text-(--color-danger) text-sm font-medium">
                  {passwordError}
                </p>
              ) : null}
            </div>

            {error ? (
              <p className="text-(--color-danger) text-sm font-medium">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="text-sm font-medium text-(--color-primary)">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              className="btn btn-l btn-primary hover:btn-primary-hover w-full"
              disabled={loading}
            >
              {loading ? "Creating…" : "Create account"}
            </button>

            <p className="text-muted text-sm font-medium">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-(--color-primary) font-bold hover:underline"
              >
                Login
              </a>
            </p>
          </form>
        </div>
      </div>
      <div className="flex justify-end">
          <div className="w-full max-w-[220px]">
            <ThemeSwitch />
          </div>
        </div>
    </main>
  );
}