"use client";

import { useState, useEffect } from "react";
import { X, Mail, UserPlus, Crown, User, Link2, Check, Copy } from "lucide-react";
import { getToken } from "@/lib/auth";
import type { ProjectMember } from "@/components/migrated/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface InviteMemberModalProps {
  onClose: () => void;
  onInvite: (member: {
    email: string;
    role: "admin" | "member";
  }) => void;
  currentMembers: ProjectMember[];
  projectId: string;
}

export default function InviteMemberModal({
  onClose,
  onInvite,
  currentMembers,
  projectId,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingLink, setLoadingLink] = useState(false);

  useEffect(() => {
    const fetchInviteLink = async () => {
      setLoadingLink(true);
      try {
        const res = await fetch(`${API_URL}/projects/${projectId}/invite-link`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInviteLink(data.inviteUrl);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingLink(false);
      }
    };
    fetchInviteLink();
  }, [projectId]);

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite({ email, role });
      setEmail("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Invite Member to Project</h2>
              <p className="mt-1 text-sm text-gray-600">Add new members to collaborate on this project</p>
            </div>
            <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Invite Link Section */}
          <div className="border-b border-gray-200 p-4 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-[#5a189a]" />
              <h3 className="text-sm font-semibold text-gray-700">Share Invite Link</h3>
            </div>
            <p className="mb-3 text-xs text-gray-500">Anyone with this link can join the project</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
                {loadingLink ? "Loading..." : inviteLink || "No link available"}
              </div>
              <button
                onClick={handleCopyLink}
                disabled={!inviteLink || loadingLink}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-[#5a189a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3c096c] disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-b border-gray-200 p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("member")}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      role === "member" ? "border-[#5a189a] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${role === "member" ? "bg-[#5a189a] text-white" : "bg-gray-100 text-gray-600"}`}>
                        <User className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Member</div>
                        <div className="text-xs text-gray-600">Can view and edit</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      role === "admin" ? "border-[#5a189a] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${role === "admin" ? "bg-[#5a189a] text-white" : "bg-gray-100 text-gray-600"}`}>
                        <Crown className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Admin</div>
                        <div className="text-xs text-gray-600">Full access</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5a189a] py-3 font-medium text-white shadow-md transition-colors hover:bg-[#3c096c]"
            >
              <UserPlus className="h-5 w-5" />
              Send Invitation
            </button>
          </form>

          <div className="p-4 sm:p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600">
              Current Members ({currentMembers.length})
            </h3>
            <div className="space-y-3">
              {currentMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${member.color} font-semibold text-white`}
                    >
                      {member.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        {member.role === "admin" && (
                          <span className="rounded-lg bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">Admin</span>
                        )}
                        {member.status === "pending" && (
                          <span className="rounded-lg bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Pending</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gray-200 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
