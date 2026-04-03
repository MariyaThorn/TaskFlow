"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListTodo } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { seedMockUsers, validateMockUser } from "@/lib/mock-auth";

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    seedMockUsers();

    if (validateMockUser(formData.email, formData.password)) {
      router.push("/dashboard/dashboard-1");
    } else {
      setErrors({ general: "Invalid email or password." });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src="/hero-images/login.jpg"
        alt="Mountain landscape"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-slate-900/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#44679f]/30 via-[#213056]/55 to-[#0a1228]/75" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-md">
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
                      : "border-white/30 focus:border-[#ffd6b3] focus:ring-[#ffd6b3]/40"
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
                      : "border-white/30 focus:border-[#ffd6b3] focus:ring-[#ffd6b3]/40"
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
                  className="h-4 w-4 rounded border-white/40 bg-white/10 accent-[#ffd6b3]"
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
              className="w-full rounded-full bg-[#ffd6b3] py-2.5 text-sm font-semibold tracking-wide text-slate-900 transition hover:bg-[#ffcaa0]"
            >
              SIGN IN
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
              <Link href="/auth/sign-up" className="font-medium text-[#ffd6b3] hover:text-[#ffcaa0]">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}