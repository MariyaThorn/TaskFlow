"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, ListTodo, Users, CircleCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useCallback } from "react";

/* ── Sparkle star SVG used as decoration ── */
function SparkleStar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
    </svg>
  );
}

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);

  /* ── Cursor sparkle effect ── */
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
    <div ref={pageRef} className="flex min-h-screen flex-col bg-[#240046]">
      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#240046] via-[#3c096c] to-[#5a189a]" />

          {/* Floating sparkle stars */}
          <SparkleStar className="absolute left-[8%] top-[12%] h-4 w-4 text-[#c77dff] opacity-60 animate-pulse" />
          <SparkleStar className="absolute right-[12%] top-[18%] h-6 w-6 text-[#9d4edd] opacity-50 animate-[pulse_3s_ease-in-out_infinite]" />
          <SparkleStar className="absolute left-[20%] top-[65%] h-3 w-3 text-[#c77dff] opacity-40 animate-[pulse_4s_ease-in-out_infinite]" />
          <SparkleStar className="absolute right-[25%] top-[8%] h-5 w-5 text-[#e0aaff] opacity-30 animate-[pulse_2.5s_ease-in-out_infinite]" />
          <SparkleStar className="absolute left-[5%] top-[45%] h-3.5 w-3.5 text-[#9d4edd] opacity-50 animate-[pulse_3.5s_ease-in-out_infinite]" />
          <SparkleStar className="absolute right-[8%] top-[55%] h-4 w-4 text-[#c77dff] opacity-40 animate-pulse" />
          <SparkleStar className="absolute left-[45%] top-[5%] h-2.5 w-2.5 text-[#e0aaff] opacity-50 animate-[pulse_2s_ease-in-out_infinite]" />
          <SparkleStar className="absolute right-[40%] top-[75%] h-3 w-3 text-[#c77dff] opacity-30 animate-[pulse_4.5s_ease-in-out_infinite]" />
          <SparkleStar className="absolute left-[70%] top-[20%] h-2 w-2 text-[#e0aaff] opacity-60 animate-[pulse_3s_ease-in-out_infinite]" />
          <SparkleStar className="absolute left-[85%] top-[70%] h-3.5 w-3.5 text-[#9d4edd] opacity-35 animate-[pulse_2.8s_ease-in-out_infinite]" />

          {/* Soft radial glow */}
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7b2cbf] opacity-20 blur-[120px]" />

          <div className="container relative mx-auto px-4 py-20 sm:py-28 lg:py-36">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#9d4edd]/30 bg-[#9d4edd]/10 px-4 py-1.5 text-sm font-medium text-[#c77dff]">
                <Sparkles className="h-4 w-4" />
                Now in public beta
              </div>
              <h1 className="mb-6 text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Organize Your Work{" "}
                <span className="bg-gradient-to-r from-[#c77dff] to-[#9d4edd] bg-clip-text text-transparent">
                  Visually
                </span>
              </h1>
              <p className="mb-10 text-base text-[#c77dff]/80 sm:text-xl">
                Collaborate, manage projects, and reach peak productivity. From brainstorming to planning to execution, TaskFlow helps your team work better together.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="auth/sign-up">
                  <Button size="lg" className="h-12 rounded-xl bg-[#9d4edd] px-8 text-lg font-medium text-white shadow-lg shadow-[#9d4edd]/25 transition-all hover:bg-[#7b2cbf] hover:shadow-[#9d4edd]/40">
                    Get Started - It&apos;s Free <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link href="auth/sign-in">
                  <Button variant="outline" size="lg" className="h-12 rounded-xl border-[#9d4edd]/40 bg-transparent px-8 text-lg font-medium text-[#c77dff] hover:bg-[#9d4edd]/10 hover:text-white">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Hero Image + Features ── */}
        <section className="relative bg-gradient-to-b from-[#5a189a] via-[#3c096c] to-[#240046] py-16">
          {/* More sparkles */}
          <SparkleStar className="absolute left-[15%] top-[10%] h-3 w-3 text-[#c77dff] opacity-30 animate-[pulse_3s_ease-in-out_infinite]" />
          <SparkleStar className="absolute right-[18%] top-[50%] h-4 w-4 text-[#9d4edd] opacity-25 animate-[pulse_4s_ease-in-out_infinite]" />

          <div>
            {/* Hero image */}
            <div className="mx-auto flex items-center justify-center px-4">
              <div className="overflow-hidden rounded-2xl border border-[#9d4edd]/20 shadow-2xl shadow-[#5a189a]/40">
                <Image
                  src="/hero-images/landing-team-task.jpg"
                  alt="Team collaborating on a project"
                  width={1200}
                  height={800}
                />
              </div>
            </div>

            <div className="mx-auto mt-12 max-w-4xl text-center sm:mt-20">
              <h2 className="mb-6 text-2xl font-bold text-white sm:text-4xl">Everything you need to stay organized</h2>
              <p className="mb-10 text-base text-[#c77dff]/70 sm:text-xl">
                Powerful features to help your team succeed
              </p>
            </div>

            {/* Feature cards */}
            <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
              <div className="group rounded-2xl border border-[#9d4edd]/20 bg-[#3c096c]/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#9d4edd]/40 hover:bg-[#3c096c]/70 hover:shadow-lg hover:shadow-[#5a189a]/30">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#9d4edd]/20 text-[#c77dff]">
                  <ListTodo className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">Boards</h3>
                <p className="mt-2 text-sm text-[#c77dff]/60">
                  Organize your projects into boards with custom columns and cards. Drag and drop to move tasks through your workflow.
                </p>
              </div>

              <div className="group rounded-2xl border border-[#9d4edd]/20 bg-[#3c096c]/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#9d4edd]/40 hover:bg-[#3c096c]/70 hover:shadow-lg hover:shadow-[#5a189a]/30">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#9d4edd]/20 text-[#c77dff]">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">Teams</h3>
                <p className="mt-2 text-sm text-[#c77dff]/60">
                  Invite your team members and collaborate in real-time. Assign tasks, set permissions, and work together seamlessly.
                </p>
              </div>

              <div className="group rounded-2xl border border-[#9d4edd]/20 bg-[#3c096c]/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#9d4edd]/40 hover:bg-[#3c096c]/70 hover:shadow-lg hover:shadow-[#5a189a]/30">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#9d4edd]/20 text-[#c77dff]">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">Real-time Updates</h3>
                <p className="mt-2 text-sm text-[#c77dff]/60">
                  See changes as they happen. Stay in sync with your team with instant updates and notifications.
                </p>
              </div>
            </div>

            {/* Built for teams section */}
            <div className="mx-auto max-w-6xl px-4 py-20">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-white sm:text-4xl">Built for teams of all sizes</h2>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                      <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#9d4edd]/20 text-[#c77dff]">
                        <CircleCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-white">Intuitive interface</p>
                        <p className="text-sm text-[#c77dff]/60">Simple, visual interface that anyone can learn in minutes</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#9d4edd]/20 text-[#c77dff]">
                        <CircleCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-white">Customizable workflows</p>
                        <p className="text-sm text-[#c77dff]/60">Adapt boards to match your team&apos;s unique process</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#9d4edd]/20 text-[#c77dff]">
                        <CircleCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-white">Powerful collaboration</p>
                        <p className="text-sm text-[#c77dff]/60">Comments, attachments, and mentions keep everyone aligned</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-[#9d4edd]/20 shadow-2xl shadow-[#5a189a]/30">
                  <Image
                    src="/hero-images/project-update.jpg"
                    alt="Project update photo"
                    width={1200}
                    height={800}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-[#5a189a]/30 bg-[#240046] py-16 text-slate-200">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 md:grid-cols-4">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-white">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#5a189a] text-white">
                    <ListTodo className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-semibold">TaskFlow</span>
                </div>
                <p className="text-sm text-[#c77dff]/50">
                  Visual project management for modern teams
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#c77dff]/70">
                  Product
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-[#c77dff]/40">
                  <li>
                    <Link href="#" className="transition-colors hover:text-[#c77dff]">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="transition-colors hover:text-[#c77dff]">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="transition-colors hover:text-[#c77dff]">
                      Security
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#c77dff]/70">
                  Company
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-[#c77dff]/40">
                  <li>
                    <Link href="#" className="transition-colors hover:text-[#c77dff]">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="transition-colors hover:text-[#c77dff]">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="transition-colors hover:text-[#c77dff]">
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#c77dff]/70">
                  Support
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-[#c77dff]/40">
                  <li>
                    <Link href="#" className="transition-colors hover:text-[#c77dff]">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="transition-colors hover:text-[#c77dff]">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="transition-colors hover:text-[#c77dff]">
                      Privacy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-16 border-t border-[#5a189a]/30 pt-8 text-center text-sm text-[#c77dff]/30">
              © 2026 TaskFlow. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}