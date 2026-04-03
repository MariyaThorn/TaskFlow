"use client";

import { useState } from "react";
import { X, User } from "lucide-react";
import type { TeamMember } from "@/components/migrated/types";

interface AddCardModalProps {
  onClose: () => void;
  onAdd: (title: string, assignee: TeamMember) => void;
  members: TeamMember[];
}

export default function AddCardModal({ onClose, onAdd, members }: AddCardModalProps) {
  const [title, setTitle] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<TeamMember | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && selectedAssignee) {
      onAdd(title, selectedAssignee);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Add New Card</h2>
            <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Card Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Assign To <span className="text-red-500">*</span>
            </label>
            {selectedAssignee ? (
              <div className="mb-2 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${selectedAssignee.color} font-semibold text-white`}
                    >
                      {selectedAssignee.avatar}
                    </div>
                    <span className="font-medium text-gray-900">{selectedAssignee.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAssignee(null)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedAssignee(member)}
                    className="flex w-full items-center gap-3 rounded-xl bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${member.color} font-semibold text-white`}
                    >
                      {member.avatar}
                    </div>
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </button>
                ))}
              </div>
            )}
            {!selectedAssignee && members.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <User className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p>No team members available</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!title.trim() || !selectedAssignee}
              className="flex-1 rounded-xl bg-[#4F46E5] py-3 font-medium text-white shadow-md transition-colors hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Card
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-gray-100 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
