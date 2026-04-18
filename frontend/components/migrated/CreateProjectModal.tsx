"use client";

import { useState } from "react";
import { X, UserPlus, Link2, Copy, Check, Search } from "lucide-react";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (project: { id: string; name: string }) => void;
}

type Step = "name" | "invite";

interface Invitation {
  emailOrUsername: string;
  role: "admin" | "member";
  status: "pending" | "sent" | "error";
  error?: string;
}

export default function CreateProjectModal({ onClose, onCreate }: CreateProjectModalProps) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Invite state
  const [inviteInput, setInviteInput] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingLink, setLoadingLink] = useState(false);

  const headers = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create project");

      setProjectId(data.project._id);
      setStep("invite");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteInput.trim()) return;

    const entry: Invitation = {
      emailOrUsername: inviteInput.trim(),
      role: inviteRole,
      status: "pending",
    };
    setInvitations((prev) => [...prev, entry]);
    setInviteInput("");

    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/invite`, {
        method: "POST",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({ emailOrUsername: entry.emailOrUsername, role: entry.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setInvitations((prev) =>
        prev.map((inv) =>
          inv === entry ? { ...inv, status: "sent" } : inv
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed";
      setInvitations((prev) =>
        prev.map((inv) =>
          inv === entry ? { ...inv, status: "error", error: msg } : inv
        )
      );
    }
  };

  const handleGenerateLink = async () => {
    setLoadingLink(true);
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/invite-link`, {
        headers: headers(),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setInviteLink(data.inviteUrl);
    } catch {
      // ignore
    } finally {
      setLoadingLink(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDone = () => {
    onCreate({ id: projectId, name });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {step === "name" ? "Create Project" : "Invite Members"}
              </h2>
              {step === "invite" && (
                <p className="mt-1 text-sm text-gray-500">Invite by email, username, or share a link</p>
              )}
            </div>
            <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {step === "name" && (
          <form onSubmit={handleCreateProject} className="space-y-4 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Product Development"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 py-2 text-center text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 rounded-xl bg-[#4F46E5] py-3 font-medium text-white shadow-md transition-colors hover:bg-[#4338CA] disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Project"}
              </button>
              <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-gray-100 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        )}

        {step === "invite" && (
          <div className="p-6 space-y-5">
            {/* Invite by email/username */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Invite by email or username</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSendInvite(); } }}
                    placeholder="email@example.com or username"
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                  className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="button"
                  onClick={handleSendInvite}
                  className="rounded-xl bg-[#4F46E5] px-4 py-2.5 text-white transition-colors hover:bg-[#4338CA]"
                >
                  <UserPlus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sent invitations list */}
            {invitations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Invitations</p>
                {invitations.map((inv, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-800">{inv.emailOrUsername}</span>
                      <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">{inv.role}</span>
                    </div>
                    {inv.status === "pending" && <span className="text-xs text-gray-400">Sending...</span>}
                    {inv.status === "sent" && <span className="text-xs text-green-600">Sent</span>}
                    {inv.status === "error" && <span className="text-xs text-red-500">{inv.error}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Invite link */}
            <div className="border-t border-gray-200 pt-4">
              <p className="mb-2 text-sm font-medium text-gray-700">Or share an invite link</p>
              {inviteLink ? (
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={inviteLink}
                    className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="rounded-xl border border-gray-300 p-2.5 transition-colors hover:bg-gray-100"
                  >
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-500" />}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateLink}
                  disabled={loadingLink}
                  className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                >
                  <Link2 className="h-4 w-4" />
                  {loadingLink ? "Generating..." : "Generate Invite Link"}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleDone}
              className="w-full rounded-xl bg-[#4F46E5] py-3 font-medium text-white shadow-md transition-colors hover:bg-[#4338CA]"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
