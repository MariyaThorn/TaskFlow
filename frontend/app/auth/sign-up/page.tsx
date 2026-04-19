"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ListTodo } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  occupation: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    occupation: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!formData.firstName.trim()) {
      next.firstName = "First name is required.";
    }
    if (!formData.lastName.trim()) {
      next.lastName = "Last name is required.";
    }
    if (!formData.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      next.password = "Password is required.";
    } else if (formData.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    return next;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    try {
      await register(formData.email.trim(), formData.password, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim() || undefined,
        occupation: formData.occupation.trim() || undefined,
      });
      router.push("/dashboard/dashboard-1");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed.";
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
      <svg className="absolute left-[12%] top-[8%] h-3.5 w-3.5 text-[#c77dff] opacity-55 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute right-[10%] top-[12%] h-4 w-4 text-[#9d4edd] opacity-45 animate-[pulse_3s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute left-[7%] top-[55%] h-3 w-3 text-[#e0aaff] opacity-40 animate-[pulse_4s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute right-[6%] top-[65%] h-2.5 w-2.5 text-[#c77dff] opacity-50 animate-[pulse_2.5s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute left-[30%] top-[85%] h-2 w-2 text-[#9d4edd] opacity-30 animate-[pulse_3.5s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute right-[28%] top-[3%] h-3 w-3 text-[#e0aaff] opacity-40 animate-[pulse_2s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute left-[80%] top-[40%] h-3 w-3 text-[#c77dff] opacity-35 animate-[pulse_4.5s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>
      <svg className="absolute left-[55%] top-[92%] h-2.5 w-2.5 text-[#9d4edd] opacity-45 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" /></svg>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-[#9d4edd]/25 bg-[#3c096c]/40 p-4 text-white shadow-2xl shadow-[#5a189a]/20 backdrop-blur-md sm:p-8">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-white/95">
              <ListTodo className="h-7 w-7" />
              <span className="text-xl font-semibold">TaskFlow</span>
            </Link>
            <h1 className="mt-6 text-3xl font-semibold">Create account</h1>
            <p className="mt-2 text-sm text-white/75">Start planning with your team in minutes</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-white/90">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={`w-full rounded-full border bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/55 focus:outline-none focus:ring-2 ${
                      errors.firstName
                        ? "border-red-300/70 focus:border-red-300 focus:ring-red-200/40"
                        : "border-[#9d4edd]/30 focus:border-[#c77dff] focus:ring-[#c77dff]/40"
                    }`}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-200">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-white/90">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={`w-full rounded-full border bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/55 focus:outline-none focus:ring-2 ${
                      errors.lastName
                        ? "border-red-300/70 focus:border-red-300 focus:ring-red-200/40"
                        : "border-[#9d4edd]/30 focus:border-[#c77dff] focus:ring-[#c77dff]/40"
                    }`}
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-200">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-white/90">Username <span className="text-white/50">(optional)</span></label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="w-full rounded-full border border-[#9d4edd]/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/55 focus:border-[#c77dff] focus:outline-none focus:ring-2 focus:ring-[#c77dff]/40"
                />
              </div>

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

              <div>
                <label className="mb-1.5 block text-sm text-white/90">Occupation <span className="text-white/50">(optional)</span></label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g. Product Manager"
                  className="w-full rounded-full border border-[#9d4edd]/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/55 focus:border-[#c77dff] focus:outline-none focus:ring-2 focus:ring-[#c77dff]/40"
                />
              </div>
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
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </Button>

            <div className="flex items-center gap-3 text-xs text-white/70">
              <div className="h-px flex-1 bg-white/30" />
              <span>Or Sign Up With</span>
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
              Already have an account?{" "}
              <Link href="/auth/sign-in" className="font-medium text-[#c77dff] hover:text-[#e0aaff]">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
