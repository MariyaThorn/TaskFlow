"use client";

import { useState } from "react";
import { X, Mail, UserPlus, Crown, User } from "lucide-react";
import type { ProjectMember } from "@/components/migrated/types";

interface InviteMemberModalProps {
  onClose: () => void;
  onInvite: (member: {
    email: string;
    role: "admin" | "member";
  }) => void;
  currentMembers: ProjectMember[];
}

export default function InviteMemberModal({
  onClose,
  onInvite,
  currentMembers,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

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
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invite Member to Project</h2>
              <p className="mt-1 text-sm text-gray-600">Add new members to collaborate on this project</p>
            </div>
            <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="border-b border-gray-200 p-6">
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
                    className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
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
                      role === "member" ? "border-[#4F46E5] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${role === "member" ? "bg-[#4F46E5] text-white" : "bg-gray-100 text-gray-600"}`}>
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
                      role === "admin" ? "border-[#4F46E5] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${role === "admin" ? "bg-[#4F46E5] text-white" : "bg-gray-100 text-gray-600"}`}>
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
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F46E5] py-3 font-medium text-white shadow-md transition-colors hover:bg-[#4338CA]"
            >
              <UserPlus className="h-5 w-5" />
              Send Invitation
            </button>
          </form>

          <div className="p-6">
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

        <div className="border-t border-gray-200 bg-gray-50 p-6">
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
