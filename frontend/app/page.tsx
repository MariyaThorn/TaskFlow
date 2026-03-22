import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, ListTodo, Users, CircleCheck, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        {/* Hero Section*/}
        <section className="container mx-auto px-4 py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-black mb-6 text-6xl font-bold">
              Organize Your Work Visually
            </h1>
            <p className="text-muted-foreground mb-10 text-xl">
              Collaborate, manage projects, and reach peak productivity. From brainstorming to planning to execution, KanbanFlow helps your team work better together.
            </p>
            <div className="flex items-center gap-4 justify-center">
              <Link href="auth/sign-up">
                <Button size="lg" className="h-12 px-8 text-lg font-medium">
                  Get Started - It's Free <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link href="auth/sign-in">
                <Button variant="outline" size="lg" className="h-12 px-8 text-lg font-medium">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </section>
        {/* Hero Images Section */}
        <section className="border-t bg-white py-16">
          <div>
            {/* Tab */}
            <div className="mx-auto flex items-center justify-center">
              <Image
                src="/hero-images/landing-team-task.jpg"
                alt="Team collaborating on a project"
                width={1200}
                height={800}
              />
            </div>
            <div className="mx-auto max-w-4xl text-center mt-18">
              <h2 className="text-black mb-6 text-4xl font-bold">Everything you need to stay organized</h2>
              <p className="text-muted-foreground mb-10 text-xl">
                Powerful features to help your team succeed
              </p>
            </div>

            {/* Feature cards */}
            <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ListTodo className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-black">Boards</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Organize your projects into boards with custom columns and cards. Drag and drop to move tasks through your workflow.
                </p>
              </div>

              <div className="rounded-xl bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-black">Teams</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Invite your team members and collaborate in real-time. Assign tasks, set permissions, and work together seamlessly.
                </p>
              </div>

              <div className="rounded-xl bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-black">Real-time Updates</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  See changes as they happen. Stay in sync with your team with instant updates and notifications.
                </p>
              </div>
            </div>

            {/* Built for teams section */}
            <div className="mx-auto max-w-6xl px-4 py-16">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                <div>
                  <h2 className="text-black mb-6 text-4xl font-bold">Built for teams of all sizes</h2>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                      <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CircleCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-black">Intuitive interface</p>
                        <p className="text-sm text-muted-foreground">Simple, visual interface that anyone can learn in minutes</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CircleCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-black">Customizable workflows</p>
                        <p className="text-sm text-muted-foreground">Adapt boards to match your team's unique process</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CircleCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-black">Powerful collaboration</p>
                        <p className="text-sm text-muted-foreground">Comments, attachments, and mentions keep everyone aligned</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="relative overflow-hidden rounded-2xl shadow-lg">
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

        {/* footer */}
        <footer className="border-t border-slate-800 bg-slate-950 py-16 text-slate-200">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 md:grid-cols-4">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-white">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                    <ListTodo className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-semibold">TaskFlow</span>
                </div>
                <p className="text-sm text-slate-400">
                  Visual project management for modern teams
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Product
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  <li>
                    <Link href="#" className="hover:text-white">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white">
                      Security
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Company
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  <li>
                    <Link href="#" className="hover:text-white">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white">
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Support
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  <li>
                    <Link href="#" className="hover:text-white">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white">
                      Privacy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-16 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
              © 2026 TaskFlow. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}