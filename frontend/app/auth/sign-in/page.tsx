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

            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center">
                <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
                  <ListTodo className="h-10 w-10" />
                </Link>
              </span>
              <span className="text-xl font-semibold">TaskFlow</span>
            </div>

            <h2 className="mt-10 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to your account to continue
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">

                {/* Email Field */}
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
                    className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 
                      ${errors.email
                        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-300"
                      }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
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
                    className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 
                      ${errors.password
                        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-300"
                      }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRememberMe(e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </Link>
              </div>

              {/* General error message */}
              {errors.general && (
                <p className="text-center text-sm text-red-500 bg-red-50 rounded-lg py-2">
                  {errors.general}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full rounded-xl py-3 text-base font-semibold"
              >
                Sign in
              </Button>

              <p className="text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Sign up
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