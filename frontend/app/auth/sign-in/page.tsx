"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ListTodo } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function SignIn() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      router.push("/dashboard/dashboard-1");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid email or password.";
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  /* Cursor sparkle effect */
  const spawnSparkle = useCallback((x: number, y: number) => {
    const el = document.createElement("div");
    const size = Math.random() * 10 + 6;
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="${size}" height="${size}"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/></svg>`;
    el.style.cssText = `position:fixed;left:${x - size / 2}px;top:${y - size / 2}px;pointer-events:none;z-index:9999;color:#c77dff;opacity:1;transition:all 0.6s ease-out;`;
    document.body.appendChild(el);
    const dx = (Math.random() - 0.5) * 40;
    const dy = (Math.random() - 0.5) * 40 - 20;
    requestAnimationFrame(() => {
      el.style.transform = `translate(${dx}px, ${dy}px) scale(0) rotate(${Math.random() * 180}deg)`;
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 650);
  }, []);

  useEffect(() => {
    let frame = 0;
    const onMove = (e: MouseEvent) => {
      frame++;
      if (frame % 3 === 0) spawnSparkle(e.clientX, e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [spawnSparkle]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#240046]">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#240046] via-[#3c096c] to-[#10002b]" />

      {/* Radial glow */}
      <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7b2cbf] opacity-15 blur-[120px]" />

      {/* Sparkle stars */}
      <svg className="absolute left-[10%] top-[15%] h-4 w-4 text-[#c77dff] opacity-60 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute right-[15%] top-[10%] h-3 w-3 text-[#9d4edd] opacity-50 animate-[pulse_3s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute left-[5%] top-[60%] h-3.5 w-3.5 text-[#e0aaff] opacity-40 animate-[pulse_4s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute right-[8%] top-[70%] h-2.5 w-2.5 text-[#c77dff] opacity-50 animate-[pulse_2.5s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute left-[25%] top-[80%] h-2 w-2 text-[#9d4edd] opacity-35 animate-[pulse_3.5s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute right-[30%] top-[5%] h-3 w-3 text-[#e0aaff] opacity-45 animate-[pulse_2s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute left-[75%] top-[45%] h-3.5 w-3.5 text-[#c77dff] opacity-30 animate-[pulse_4.5s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute left-[50%] top-[90%] h-2.5 w-2.5 text-[#9d4edd] opacity-40 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-[#9d4edd]/25 bg-[#3c096c]/40 p-4 text-white shadow-2xl shadow-[#5a189a]/20 backdrop-blur-md sm:p-8">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-white/95">
              <ListTodo className="h-7 w-7" />
              <span className="text-xl font-semibold">TaskFlow</span>
            </Link>
            <h1 className="mt-6 text-3xl font-semibold">Have an account?</h1>
            <p className="mt-2 text-sm text-white/75">Sign in and continue your workflow</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-white/90">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="username@email.com"
                  className={`w-full rounded-full border bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/55 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-300/70 focus:border-red-300 focus:ring-red-200/40"
                      : "border-[#9d4edd]/30 focus:border-[#c77dff] focus:ring-[#c77dff]/40"
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-200">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-white/90">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full rounded-full border bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/55 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-300/70 focus:border-red-300 focus:ring-red-200/40"
                      : "border-[#9d4edd]/30 focus:border-[#c77dff] focus:ring-[#c77dff]/40"
                  }`}
                />
                {errors.password && <p className="mt-1 text-xs text-red-200">{errors.password}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-white/80">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#9d4edd]/40 bg-white/10 accent-[#c77dff]"
                />
                Remember me
              </label>
              <Link href="#" className="hover:text-white">
                Forgot password?
              </Link>
            </div>

            {errors.general && (
              <p className="rounded-lg border border-red-200/40 bg-red-500/15 py-2 text-center text-sm text-red-100">
                {errors.general}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#9d4edd] py-2.5 text-sm font-semibold tracking-wide text-white transition hover:bg-[#7b2cbf] disabled:opacity-60"
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </Button>

            <div className="flex items-center gap-3 text-xs text-white/70">
              <div className="h-px flex-1 bg-white/30" />
              <span>Or Sign In With</span>
              <div className="h-px flex-1 bg-white/30" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Facebook
              </button>
              <button
                type="button"
                className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Twitter
              </button>
            </div>

            <p className="pt-1 text-center text-sm text-white/80">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="font-medium text-[#c77dff] hover:text-[#e0aaff]">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}