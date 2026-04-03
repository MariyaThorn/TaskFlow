"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ListTodo } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerMockUser, seedMockUsers } from "@/lib/mock-auth";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    seedMockUsers();
  }, []);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    const result = registerMockUser({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (!result.ok) {
      setErrors({ general: result.message });
      return;
    }

    router.push("/dashboard/dashboard-1");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left panel */}
        <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 px-10 py-16 text-white items-center">
          <div className="relative z-10 max-w-lg">

            <h1 className="text-4xl font-bold leading-tight">
              Welcome to TaskFlow
            </h1>
            <p className="mt-4 max-w-md text-base text-white/80">
              Organize your work visually and collaborate with your team in real-time. Get started in seconds.
            </p>

            <div className="mt-10">
              <Image
                src="/hero-images/login.jpg"
                alt="Hands working on a project"
                width={600}
                height={400}
                className="rounded-xl object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center">
                <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
                <ListTodo className="h-10 w-10" />
                </Link>
              </span>
              <span className="text-xl font-semibold">TaskFlow</span>
            </div>

            <h2 className="mt-10 text-3xl font-bold tracking-tight text-slate-900">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Sign up to get started with KanbanFlow
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
                      errors.password
                        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-300"
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>
              </div>

              {errors.general && (
                <p className="rounded-lg bg-red-50 py-2 text-center text-sm text-red-500">
                  {errors.general}
                </p>
              )}

              <Button type="submit" className="w-full rounded-xl py-3 text-base font-semibold">
                Create Account
              </Button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/auth/sign-in" className="font-medium text-indigo-600 hover:text-indigo-700">
                  Sign In
                </Link>
              </p>

              <p className="text-center text-xs text-slate-400">
                By continuing, you agree to our{" "}
                <Link href="#" className="font-medium text-slate-600 hover:text-slate-800">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="font-medium text-slate-600 hover:text-slate-800">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
