"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  Crown,
  UserMinus,
  LayoutGrid,
  Clock,
  ArrowLeft,
  Trash2,
  Import,
  Users,
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import { getToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/utils";

interface TeamMember {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatar: string;
  color: string;
}

interface TeamProject {
  id: string;
  name: string;
  memberCount: number;
  updatedAt: string;
}

interface ImportableProject {
  id: string;
  name: string;
}

const fallbackColors = [
  "from-blue-500 to-blue-600",
  "from-green-500 to-green-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-pink-600",
  "from-orange-500 to-orange-600",
  "from-teal-500 to-teal-600",
];

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;

  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [myRole, setMyRole] = useState<"owner" | "admin" | "member">("member");
  const [activeTab, setActiveTab] = useState<"members" | "projects">("members");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<TeamProject[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importableProjects, setImportableProjects] = useState<ImportableProject[]>([]);
  const [confirmDeleteTeam, setConfirmDeleteTeam] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const headers = useCallback((): Record<string, string> => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/teams/${teamId}`, { headers: headers(), credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const t = data.team;
      setTeamName(t.name);
      setTeamDescription(t.description || "");
      const userId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("taskflow_user") || "{}").id : null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: TeamMember[] = t.members.map((m: any, i: number) => ({
        memberId: m._id,
        userId: m.user?._id || "",
        name: `${m.user?.firstName || ""} ${m.user?.lastName || ""}`.trim() || m.user?.email || "Unknown",
        email: m.user?.email || "",
        avatar: `${(m.user?.firstName?.[0] || "").toUpperCase()}${(m.user?.lastName?.[0] || "").toUpperCase()}` || (m.user?.email || "??").substring(0, 2).toUpperCase(),
        color: m.user?.avatarColor || fallbackColors[i % fallbackColors.length],
        role: m.role,
      }));
      setMembers(mapped);
      const me = mapped.find((m) => m.userId === userId);
      if (me) setMyRole(me.role);
      setProjects(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (t.projects || []).map((p: any) => ({ id: p._id, name: p.name, memberCount: p.members?.length || 0, updatedAt: p.updatedAt || new Date().toISOString() }))
      );
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const fetchImportable = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/projects`, { headers: headers(), credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const teamProjectIds = projects.map((p) => p.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const available = data.projects.filter((p: any) => !p.team && !teamProjectIds.includes(p._id)).map((p: any) => ({ id: p._id, name: p.name }));
      setImportableProjects(available);
    } catch { /* ignore */ }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      const res = await fetch(`${getApiUrl()}/teams/${teamId}/members`, { method: "POST", headers: { "Content-Type": "application/json", ...headers() }, credentials: "include", body: JSON.stringify({ emailOrUsername: inviteEmail.trim(), role: inviteRole }) });
      const data = await res.json();
      if (!res.ok) { showMsg("error", data.message || "Failed to invite"); return; }
      setInviteEmail(""); setShowInviteForm(false); showMsg("success", "Member added!"); fetchTeam();
    } catch { showMsg("error", "Failed to invite member"); }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/teams/${teamId}/members/${memberId}`, { method: "DELETE", headers: headers(), credentials: "include" });
      if (!res.ok) { const data = await res.json(); showMsg("error", data.message || "Failed to remove"); return; }
      fetchTeam();
    } catch { showMsg("error", "Failed to remove member"); }
  };

  const handleChangeRole = async (memberId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    try {
      const res = await fetch(`${getApiUrl()}/teams/${teamId}/members/${memberId}/role`, { method: "PUT", headers: { "Content-Type": "application/json", ...headers() }, credentials: "include", body: JSON.stringify({ role: newRole }) });
      if (!res.ok) { const data = await res.json(); showMsg("error", data.message || "Failed to update role"); return; }
      fetchTeam();
    } catch { showMsg("error", "Failed to change role"); }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const res = await fetch(`${getApiUrl()}/teams/${teamId}/projects`, { method: "POST", headers: { "Content-Type": "application/json", ...headers() }, credentials: "include", body: JSON.stringify({ name: newProjectName.trim() }) });
      if (!res.ok) { const data = await res.json(); showMsg("error", data.message || "Failed to create project"); return; }
      setNewProjectName(""); setShowNewProject(false); showMsg("success", "Project created!"); fetchTeam();
    } catch { showMsg("error", "Failed to create project"); }
  };

  const handleImportProject = async (projectId: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/teams/${teamId}/projects`, { method: "POST", headers: { "Content-Type": "application/json", ...headers() }, credentials: "include", body: JSON.stringify({ projectId }) });
      if (!res.ok) { const data = await res.json(); showMsg("error", data.message || "Failed to import"); return; }
      setShowImport(false); showMsg("success", "Project imported!"); fetchTeam();
    } catch { showMsg("error", "Failed to import project"); }
  };

  const handleRemoveProject = async (projectId: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/teams/${teamId}/projects/${projectId}`, { method: "DELETE", headers: headers(), credentials: "include" });
      if (!res.ok) { const data = await res.json(); showMsg("error", data.message || "Failed to remove project"); return; }
      fetchTeam();
    } catch { showMsg("error", "Failed to remove project"); }
  };

  const handleDeleteTeam = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/teams/${teamId}`, { method: "DELETE", headers: headers(), credentials: "include" });
      if (!res.ok) { const data = await res.json(); showMsg("error", data.message || "Failed to delete team"); return; }
      router.push("/dashboard/teams");
    } catch { showMsg("error", "Failed to delete team"); }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const isOwnerOrAdmin = myRole === "owner" || myRole === "admin";

  return (
    <div className="flex min-h-screen bg-[#f8f0ff]">
      <Sidebar activeItem="Teams" />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#e0aaff]/30 bg-[#ede0ff] px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard/teams")} className="rounded-lg p-1.5 transition-colors hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{teamName}</h1>
              {teamDescription && <p className="text-xs text-gray-500">{teamDescription}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {members.slice(0, 5).map((member, i) => (
                <div key={member.memberId} className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${member.color} text-xs font-semibold text-white ring-2 ring-white ${i > 0 ? "-ml-2" : ""}`} title={member.name}>{member.avatar}</div>
              ))}
              {members.length > 5 && <div className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 ring-2 ring-white">+{members.length - 5}</div>}
            </div>
            <span className="text-sm text-gray-500">{members.length} {members.length === 1 ? "member" : "members"}</span>
            {myRole === "owner" && (
              <button onClick={() => setConfirmDeleteTeam(true)} className="ml-2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600" title="Delete team">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {message && <div className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.text}</div>}

          <div className="mb-8 border-b border-gray-200">
            <nav className="flex gap-8">
              <button onClick={() => setActiveTab("members")} className={`border-b-2 px-1 pb-4 font-medium transition-colors ${activeTab === "members" ? "border-[#5a189a] text-[#5a189a]" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>Members ({members.length})</button>
              <button onClick={() => setActiveTab("projects")} className={`border-b-2 px-1 pb-4 font-medium transition-colors ${activeTab === "projects" ? "border-[#5a189a] text-[#5a189a]" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>Projects ({projects.length})</button>
            </nav>
          </div>

          {activeTab === "members" && (
            <>
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow-md"><div className="flex items-center justify-between"><div><p className="mb-1 text-sm text-gray-600">Total Members</p><p className="text-3xl font-bold text-gray-900">{members.length}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100"><Users className="h-6 w-6 text-blue-600" /></div></div></div>
                <div className="rounded-2xl bg-white p-6 shadow-md"><div className="flex items-center justify-between"><div><p className="mb-1 text-sm text-gray-600">Admins</p><p className="text-3xl font-bold text-gray-900">{members.filter((m) => m.role === "admin" || m.role === "owner").length}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100"><Crown className="h-6 w-6 text-purple-600" /></div></div></div>
                <div className="rounded-2xl bg-white p-6 shadow-md"><div className="flex items-center justify-between"><div><p className="mb-1 text-sm text-gray-600">Projects</p><p className="text-3xl font-bold text-gray-900">{projects.length}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100"><LayoutGrid className="h-6 w-6 text-green-600" /></div></div></div>
              </div>

              {isOwnerOrAdmin && (
                <div className="mb-8 rounded-2xl bg-white p-6 shadow-md">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">Invite Team Members</h2>
                  {showInviteForm ? (
                    <form onSubmit={handleInvite} className="space-y-3">
                      <div className="flex gap-3">
                        <input type="text" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Email or username" className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]" required autoFocus />
                        <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "member" | "admin")} className="rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]"><option value="member">Member</option><option value="admin">Admin</option></select>
                        <button type="submit" className="rounded-xl bg-[#5a189a] px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-[#3c096c]">Add</button>
                        <button type="button" onClick={() => { setShowInviteForm(false); setInviteEmail(""); }} className="rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setShowInviteForm(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-[#f8f0ff] px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"><Plus className="h-5 w-5" />Invite new member</button>
                  )}
                </div>
              )}

              <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                <div className="border-b border-gray-200 p-6"><h2 className="text-xl font-semibold text-gray-900">All Members</h2></div>
                <div className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <div key={member.memberId} className="p-6 transition-colors hover:bg-[#f8f0ff]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${member.color} font-semibold text-white`}>{member.avatar}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{member.name}</h3>
                              {member.role === "owner" && <span className="rounded-lg bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">Owner</span>}
                              {member.role === "admin" && <span className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">Admin</span>}
                            </div>
                            <p className="text-sm text-gray-600">{member.email}</p>
                          </div>
                        </div>
                        {myRole === "owner" && member.role !== "owner" && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleChangeRole(member.memberId, member.role)} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">{member.role === "admin" ? "Remove Admin" : "Make Admin"}</button>
                            <button onClick={() => handleRemoveMember(member.memberId)} className="rounded-xl p-2 text-red-600 transition-colors hover:bg-red-50"><UserMinus className="h-5 w-5" /></button>
                          </div>
                        )}
                        {myRole === "admin" && member.role === "member" && <button onClick={() => handleRemoveMember(member.memberId)} className="rounded-xl p-2 text-red-600 transition-colors hover:bg-red-50"><UserMinus className="h-5 w-5" /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "projects" && (
            <>
              {isOwnerOrAdmin && (
                <div className="mb-8 rounded-2xl bg-white p-6 shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Team Projects</h2>
                      <p className="text-sm text-gray-600">All team members automatically get access to these projects</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setShowImport(true); fetchImportable(); }} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-[#f8f0ff]"><Import className="h-4 w-4" />Import Existing</button>
                      <button onClick={() => setShowNewProject(true)} className="flex items-center gap-2 rounded-xl bg-[#5a189a] px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#3c096c]"><Plus className="h-4 w-4" />New Project</button>
                    </div>
                  </div>
                  {showNewProject && (
                    <div className="mt-4 flex gap-3">
                      <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Project name" onKeyDown={(e) => { if (e.key === "Enter") handleCreateProject(); if (e.key === "Escape") { setShowNewProject(false); setNewProjectName(""); } }} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]" autoFocus />
                      <button onClick={handleCreateProject} className="rounded-xl bg-[#5a189a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#3c096c]">Create</button>
                      <button onClick={() => { setShowNewProject(false); setNewProjectName(""); }} className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Cancel</button>
                    </div>
                  )}
                  {showImport && (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-[#f8f0ff] p-4">
                      <h3 className="mb-3 text-sm font-medium text-gray-700">Select a project to import</h3>
                      {importableProjects.length === 0 ? (
                        <p className="text-sm text-gray-500">No available projects to import.</p>
                      ) : (
                        <div className="space-y-2">
                          {importableProjects.map((p) => (
                            <button key={p.id} onClick={() => handleImportProject(p.id)} className="flex w-full items-center justify-between rounded-lg bg-white px-4 py-3 text-left text-sm shadow-sm transition-colors hover:bg-blue-50">
                              <span className="font-medium text-gray-900">{p.name}</span>
                              <span className="text-xs text-[#5a189a]">Import</span>
                            </button>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setShowImport(false)} className="mt-3 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                    </div>
                  )}
                </div>
              )}

              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-md">
                  <LayoutGrid className="mb-4 h-12 w-12 text-gray-300" />
                  <h3 className="mb-1 text-lg font-semibold text-gray-900">No projects yet</h3>
                  <p className="text-sm text-gray-500">Create a new project or import an existing one</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <div key={project.id} className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl">
                      {isOwnerOrAdmin && (
                        <button onClick={() => handleRemoveProject(project.id)} className="absolute right-2 top-2 z-10 hidden rounded-lg bg-white/90 p-1.5 text-gray-400 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 group-hover:block" title="Remove from team"><Trash2 className="h-4 w-4" /></button>
                      )}
                      <button onClick={() => router.push(`/dashboard/project/${project.id}`)} className="w-full text-left">
                        <div className="h-24 bg-gradient-to-br from-[#5a189a] to-[#9d4edd]"><div className="flex h-full items-center justify-center"><LayoutGrid className="h-8 w-8 text-white opacity-40" /></div></div>
                        <div className="p-5">
                          <h3 className="mb-3 text-lg font-semibold text-gray-900 transition-colors group-hover:text-[#5a189a]">{project.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /><span>{project.memberCount}</span></div>
                            <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /><span>{timeAgo(project.updatedAt)}</span></div>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {confirmDeleteTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmDeleteTeam(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Delete Team</h3>
            <p className="mb-4 text-sm text-gray-600">This will delete <strong>{teamName}</strong>. Projects will be unlinked but not deleted.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteTeam(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleDeleteTeam} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}