import { Button } from "@/components/ui/button";
import { ListTodo } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SignIn() {
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
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to your account to continue
            </p>

            <form className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
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

              <Button className="w-full rounded-xl py-3 text-base font-semibold">
                Sign in
              </Button>

              <p className="text-center text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="font-medium text-indigo-600 hover:text-indigo-700">
                  Sign up
                </Link>
              </p>

              <p className="text-center text-xs text-slate-400">
                By continuing, you agree to our{' '}
                <Link href="#" className="font-medium text-slate-600 hover:text-slate-800">
                  Terms of Service
                </Link>{' '}
                and{' '}
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
