"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken, isAuthenticated } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [status, setStatus] = useState<"loading" | "success" | "error" | "auth-required">("loading");
  const [message, setMessage] = useState("");
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      setStatus("auth-required");
      return;
    }

    const join = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/projects/join/${code}`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.message || "Invalid invite link");
          return;
        }
        setStatus("success");
        setProjectName(data.project?.name || "");
        setMessage(data.message);
      } catch {
        setStatus("error");
        setMessage("Something went wrong");
      }
    };

    join();
  }, [code]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        {status === "loading" && (
          <p className="text-gray-600">Joining project...</p>
        )}

        {status === "auth-required" && (
          <>
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Sign in required</h1>
            <p className="mb-6 text-gray-600">You need to sign in before joining this project.</p>
            <button
              onClick={() => router.push(`/auth/sign-in?redirect=/invite/${code}`)}
              className="rounded-xl bg-[#5a189a] px-6 py-3 font-medium text-white transition-colors hover:bg-[#3c096c]"
            >
              Sign In
            </button>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              {message === "Already a member" ? "Already a member" : "Joined!"}
            </h1>
            <p className="mb-6 text-gray-600">
              {projectName ? `You're now part of "${projectName}".` : "You've joined the project."}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl bg-[#5a189a] px-6 py-3 font-medium text-white transition-colors hover:bg-[#3c096c]"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Oops</h1>
            <p className="mb-6 text-gray-600">{message}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
