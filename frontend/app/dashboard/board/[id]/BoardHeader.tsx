"use client";

import { Plus, UserPlus, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TeamMember } from "@/components/migrated/types";

interface BoardHeaderProps {
  projectName: string;
  boardName: string;
  projectId: string;
  projectMembers: TeamMember[];
  currentUserId: string | null;
}

export default function BoardHeader({ projectName, boardName, projectId, projectMembers, currentUserId }: BoardHeaderProps) {
  const router = useRouter();

  return (
    <div className="shrink-0 mx-8 mt-6 mb-4 rounded-2xl bg-white px-6 py-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(projectId ? `/dashboard/project/${projectId}` : "/dashboard")}
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{projectName ? `${projectName} - ${boardName}` : boardName}</h1>
            <p className="text-xs text-gray-500">{projectMembers.length} member{projectMembers.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {projectMembers.map((member, i) => {
              const isCurrentUser = member.id === currentUserId;
              return (
                <div
                  key={member.id}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${member.color} text-xs font-semibold text-white ring-2 ring-white transition-transform hover:scale-110 ${i > 0 ? "-ml-2" : ""}`}
                  title={`${member.name}${isCurrentUser ? " (you)" : ""}`}
                >
                  {member.avatar}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                      isCurrentUser ? "bg-green-400" : "bg-gray-400"
                    }`}
                  />
                </div>
              );
            })}
            <button
              onClick={() => projectId && router.push(`/dashboard/project/${projectId}`)}
              className="flex h-8 w-8 -ml-1 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400 transition-all hover:border-[#4F46E5] hover:text-[#4F46E5]"
              title="Invite members"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => projectId && router.push(`/dashboard/project/${projectId}`)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <UserPlus className="h-4 w-4" />
            Invite
          </button>
        </div>
      </div>
    </div>
  );
}
