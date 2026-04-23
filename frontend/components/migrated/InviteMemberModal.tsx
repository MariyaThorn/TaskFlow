"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, UserPlus, Crown, User, Link2, Check, Copy, UserMinus, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { getToken } from "@/lib/auth";
import type { ProjectMember } from "@/components/migrated/types";

import { getApiUrl } from "@/lib/utils";

interface SearchUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  avatarColor?: string;
}

interface InviteMemberModalProps {
  onClose: () => void;
  onInvite: (member: {
    email: string;
    role: "admin" | "member";
  }) => void;
  currentMembers: ProjectMember[];
  projectId: string;
  myRole?: "owner" | "admin" | "member";
  onKick?: (member: ProjectMember) => void;
  onCancelInvitation?: (member: ProjectMember) => void;
}

export default function InviteMemberModal({
  onClose,
  onInvite,
  currentMembers,
  projectId,
  myRole,
  onKick,
  onCancelInvitation,
}: InviteMemberModalProps) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingLink, setLoadingLink] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  // Search state
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [sending, setSending] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchInviteLink = async () => {
      setLoadingLink(true);
      try {
        const res = await fetch(`${getApiUrl()}/projects/${projectId}/invite-link`, {
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

  const searchUsers = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setNoResults(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`${getApiUrl()}/users/search?q=${encodeURIComponent(q.trim())}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users);
        setNoResults(data.users.length === 0);
        setShowDropdown(true);
      }
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }, [currentMembers]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setNoResults(false);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      searchUsers(value);
    }, 300);
  };

  const handleSelectUser = (user: SearchUser) => {
    if (!selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers((prev) => [...prev, user]);
    }
    setQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setNoResults(false);
    inputRef.current?.focus();
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteLink);
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch {
      // Fallback for insecure contexts (e.g. LAN IP)
      const textarea = document.createElement("textarea");
      textarea.value = inviteLink;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateLink = async () => {
    setRegenerating(true);
    try {
      const res = await fetch(`${getApiUrl()}/projects/${projectId}/regenerate-invite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInviteLink(data.inviteUrl);
        showToast("success", "Invite link regenerated");
      } else {
        showToast("error", "Failed to regenerate link");
      }
    } catch {
      showToast("error", "Failed to regenerate link");
    } finally {
      setRegenerating(false);
    }
  };

  const handleKickInline = async (member: ProjectMember) => {
    try {
      const res = await fetch(`${getApiUrl()}/projects/${projectId}/members/${member.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const data = await res.json();
        showToast("error", data.message || "Failed to remove member");
        return;
      }
      showToast("success", `${member.name} has been removed`);
      if (onKick) onKick(member);
    } catch {
      showToast("error", "Failed to remove member");
    }
  };

  const handleCancelInline = async (member: ProjectMember) => {
    try {
      const res = await fetch(`${getApiUrl()}/projects/${projectId}/invitations/${member.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const data = await res.json();
        showToast("error", data.message || "Failed to cancel invitation");
        return;
      }
      showToast("success", "Invitation cancelled");
      if (onCancelInvitation) onCancelInvitation(member);
    } catch {
      showToast("error", "Failed to cancel invitation");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;
    setSending(true);
    let successCount = 0;
    const errors: string[] = [];
    for (const user of selectedUsers) {
      try {
        const res = await fetch(`${getApiUrl()}/projects/${projectId}/invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ emailOrUsername: user.email, role }),
        });
        const data = await res.json();
        if (!res.ok) {
          errors.push(`${user.firstName}: ${data.message || "Failed"}`);
        } else {
          successCount++;
        }
      } catch {
        errors.push(`${user.firstName}: Failed to invite`);
      }
    }
    setSending(false);
    if (successCount > 0) {
      showToast("success", `${successCount} invitation${successCount > 1 ? "s" : ""} sent!`);
      if (onInvite) onInvite({ email: "", role });
    }
    if (errors.length > 0) {
      showToast("error", errors.join("; "));
    }
    setSelectedUsers([]);
    setQuery("");
  };

  const activeMembers = currentMembers.filter((m) => m.status === "active");
  const pendingMembers = currentMembers.filter((m) => m.status === "pending");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Manage Members</h2>
              <p className="mt-1 text-sm text-gray-600">Invite, remove, or manage project members</p>
            </div>
            <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          {/* Toast inside modal */}
          {toast && (
            <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${toast.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {toast.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {toast.text}
              <button onClick={() => setToast(null)} className="ml-auto rounded p-0.5 hover:bg-black/5"><X className="h-3 w-3" /></button>
            </div>
          )}
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
              <input
                type="text"
                readOnly
                value={loadingLink ? "Loading..." : inviteLink || "No link available"}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 cursor-text rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600 outline-none focus:border-[#5a189a] focus:ring-1 focus:ring-[#5a189a]"
              />
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
              {(myRole === "owner" || myRole === "admin") && (
                <button
                  onClick={handleRegenerateLink}
                  disabled={regenerating}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
                  title="Regenerate invite link"
                >
                  <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-b border-gray-200 p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Search User <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                    placeholder="Search by name, email, or username..."
                    className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]"
                    autoFocus
                    autoComplete="off"
                  />
                  {searching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#5a189a] border-t-transparent" />
                    </div>
                  )}

                  {/* Search dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                      {searchResults.map((user) => {
                        const memberEmails = currentMembers.map((m) => m.email.toLowerCase());
                        const isAlreadyMember = memberEmails.includes(user.email.toLowerCase());
                        const isAlreadySelected = selectedUsers.some((u) => u._id === user._id);
                        const isDisabled = isAlreadyMember || isAlreadySelected;
                        return (
                          <button
                            key={user._id}
                            type="button"
                            onClick={() => !isDisabled && handleSelectUser(user)}
                            disabled={isDisabled}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${isDisabled ? "cursor-not-allowed opacity-50" : "hover:bg-[#f8f0ff]"}`}
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${user.avatarColor ? `bg-gradient-to-br ${user.avatarColor}` : "bg-gradient-to-br from-[#5a189a] to-[#9d4edd]"}`}>
                              {(user.firstName?.[0] || "").toUpperCase()}{(user.lastName?.[0] || user.email?.[0] || "").toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="truncate text-xs text-gray-500">{user.email}</p>
                            </div>
                            {isAlreadyMember && (
                              <span className="shrink-0 rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Already in project</span>
                            )}
                            {isAlreadySelected && !isAlreadyMember && (
                              <span className="shrink-0 rounded-lg bg-[#f8f0ff] px-2 py-0.5 text-xs font-medium text-[#5a189a]">Selected</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* No results */}
                  {noResults && query.trim().length >= 2 && !searching && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        No user found matching &ldquo;{query.trim()}&rdquo;
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected users chips */}
                {selectedUsers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedUsers.map((user) => (
                      <div key={user._id} className="flex items-center gap-1.5 rounded-full bg-[#f8f0ff] py-1 pl-1 pr-2.5">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white ${user.avatarColor ? `bg-gradient-to-br ${user.avatarColor}` : "bg-gradient-to-br from-[#5a189a] to-[#9d4edd]"}`}>
                          {(user.firstName?.[0] || "").toUpperCase()}{(user.lastName?.[0] || "").toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-[#3c096c]">{user.firstName} {user.lastName}</span>
                        <button type="button" onClick={() => handleRemoveUser(user._id)} className="ml-0.5 rounded-full p-0.5 text-gray-400 hover:bg-[#e0aaff]/30 hover:text-gray-600">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
              disabled={selectedUsers.length === 0 || sending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5a189a] py-3 font-medium text-white shadow-md transition-colors hover:bg-[#3c096c] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <UserPlus className="h-5 w-5" />
              )}
              {selectedUsers.length > 1 ? `Send ${selectedUsers.length} Invitations` : "Send Invitation"}
            </button>
          </form>

          <div className="p-4 sm:p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600">
              Members ({activeMembers.length})
            </h3>
            <div className="space-y-2">
              {activeMembers.map((member) => (
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
                        {member.role === "owner" && (
                          <span className="flex items-center gap-1 rounded-lg bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700"><Crown className="h-3 w-3" /> Owner</span>
                        )}
                        {member.role === "admin" && (
                          <span className="rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Admin</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                  {onKick && ((myRole === "owner" && member.role !== "owner") ||
                    (myRole === "admin" && member.role === "member")) && (
                    <button
                      onClick={() => handleKickInline(member)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      title={`Remove ${member.name}`}
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Pending Invitations */}
            {pendingMembers.length > 0 && (
              <>
                <h3 className="mb-4 mt-6 text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Pending Invitations ({pendingMembers.length})
                </h3>
                <div className="space-y-2">
                  {pendingMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-xl bg-amber-50/50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-500">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{member.email}</p>
                          <p className="text-xs text-amber-600">Invitation pending</p>
                        </div>
                      </div>
                      {onCancelInvitation && (myRole === "owner" || myRole === "admin") && (
                        <button
                          onClick={() => handleCancelInline(member)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                          title="Cancel invitation"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
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
