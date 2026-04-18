"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListTodo } from "lucide-react";
import Image from "next/image";
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
            <h1 className="mt-6 text-3xl font-semibold">Create account</h1>
            <p className="mt-2 text-sm text-white/75">Start planning with your team in minutes</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
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
                        : "border-white/30 focus:border-[#ffd6b3] focus:ring-[#ffd6b3]/40"
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
                        : "border-white/30 focus:border-[#ffd6b3] focus:ring-[#ffd6b3]/40"
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
                  className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/55 focus:border-[#ffd6b3] focus:outline-none focus:ring-2 focus:ring-[#ffd6b3]/40"
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

              <div>
                <label className="mb-1.5 block text-sm text-white/90">Occupation <span className="text-white/50">(optional)</span></label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g. Product Manager"
                  className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/55 focus:border-[#ffd6b3] focus:outline-none focus:ring-2 focus:ring-[#ffd6b3]/40"
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
              className="w-full rounded-full bg-[#ffd6b3] py-2.5 text-sm font-semibold tracking-wide text-slate-900 transition hover:bg-[#ffcaa0] disabled:opacity-60"
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
              <Link href="/auth/sign-in" className="font-medium text-[#ffd6b3] hover:text-[#ffcaa0]">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
