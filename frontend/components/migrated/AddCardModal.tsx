"use client";

import { useState } from "react";
import { X, User, ChevronDown, ChevronUp } from "lucide-react";
import type { TeamMember, KanbanLabel } from "@/components/migrated/types";

const LABEL_COLORS = [
  { name: "Red", value: "bg-red-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Yellow", value: "bg-yellow-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Blue", value: "bg-blue-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Pink", value: "bg-pink-500" },
  { name: "Indigo", value: "bg-indigo-500" },
];

interface AddCardModalProps {
  onClose: () => void;
  onAdd: (data: { title: string; description?: string; dueDate?: string; labels?: KanbanLabel[]; assignee?: TeamMember }) => void;
  members: TeamMember[];
}

export default function AddCardModal({ onClose, onAdd, members }: AddCardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState<KanbanLabel[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<TeamMember | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({
        title,
        description: description || undefined,
        dueDate: dueDate || undefined,
        labels: labels.length > 0 ? labels : undefined,
        assignee: selectedAssignee || undefined,
      });
      onClose();
    }
  };

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;
    setLabels([...labels, { id: `label-${Date.now()}`, name: newLabelName.trim(), color: newLabelColor }]);
    setNewLabelName("");
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

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto space-y-4 p-6">
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

          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1 text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]"
          >
            {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showMore ? "Less options" : "More options (description, due date, labels)"}
          </button>

          {showMore && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Due Date <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Labels <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {labels.map((label) => (
                    <span
                      key={label.id}
                      className={`${label.color} cursor-pointer rounded-xl px-3 py-1 text-sm font-medium text-white`}
                      onClick={() => setLabels(labels.filter((l) => l.id !== label.id))}
                      title="Click to remove"
                    >
                      {label.name} &times;
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name..."
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddLabel(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddLabel}
                    disabled={!newLabelName.trim()}
                    className="rounded-lg bg-[#4F46E5] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#4338CA] disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {LABEL_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewLabelColor(c.value)}
                      className={`h-6 w-6 rounded-full ${c.value} ${newLabelColor === c.value ? "ring-2 ring-offset-1 ring-gray-800" : ""}`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Assign To <span className="text-xs text-gray-400">(optional)</span>
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
              disabled={!title.trim()}
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
