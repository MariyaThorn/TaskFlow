"use client";

import { useState } from "react";
import { Calendar, MessageSquare, Paperclip, Trash2 } from "lucide-react";
import type { Card } from "@/components/migrated/types";
import UserAvatar from "@/components/migrated/UserAvatar";

interface KanbanCardProps {
  card: Card;
  columnId: string;
  columnTitle: string;
  boardColor?: string;
  onClick: () => void;
  onDelete?: (cardId: string) => void;
  onUnassign?: (cardId: string) => void;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  "To Do": { label: "To Do", bg: "bg-gray-100", text: "text-gray-600" },
  "In Progress": { label: "In Progress", bg: "bg-blue-100", text: "text-blue-700" },
  "Review": { label: "Review", bg: "bg-amber-100", text: "text-amber-700" },
  "Done": { label: "Done", bg: "bg-green-100", text: "text-green-700" },
};

export default function KanbanCard({ card, columnId, columnTitle, boardColor, onClick, onDelete, onUnassign }: KanbanCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasDueDate = Boolean(card.dueDate);
  const dueDate = hasDueDate ? new Date(card.dueDate) : null;
  const now = new Date();
  const soonThreshold = new Date(now);
  soonThreshold.setDate(soonThreshold.getDate() + 3);
  const isOverdue = dueDate ? dueDate < now : false;
  const isDueSoon = dueDate ? dueDate < soonThreshold : false;

  const status = statusConfig[columnTitle] || statusConfig["To Do"];
  const progress = card.progress ?? 0;
  const isDone = columnTitle === "Done";

  // Derive a subtle accent color from boardColor for the left border
  const colorMap: Record<string, string> = {
    "from-blue-500 to-blue-600": "border-l-blue-500",
    "from-purple-500 to-purple-600": "border-l-purple-500",
    "from-pink-500 to-pink-600": "border-l-pink-500",
    "from-green-500 to-green-600": "border-l-green-500",
    "from-orange-500 to-orange-600": "border-l-orange-500",
    "from-red-500 to-red-600": "border-l-red-500",
    "from-indigo-500 to-indigo-600": "border-l-indigo-500",
    "from-teal-500 to-teal-600": "border-l-teal-500",
  };
  const borderAccent = boardColor ? (colorMap[boardColor] || "border-l-indigo-500") : "border-l-indigo-500";

  // Progress bar color from boardColor
  const progressBarMap: Record<string, string> = {
    "from-blue-500 to-blue-600": "bg-blue-500",
    "from-purple-500 to-purple-600": "bg-purple-500",
    "from-pink-500 to-pink-600": "bg-pink-500",
    "from-green-500 to-green-600": "bg-green-500",
    "from-orange-500 to-orange-600": "bg-orange-500",
    "from-red-500 to-red-600": "bg-red-500",
    "from-indigo-500 to-indigo-600": "bg-indigo-500",
    "from-teal-500 to-teal-600": "bg-teal-500",
  };
  const progressBarColor = isDone ? "bg-green-500" : (boardColor ? (progressBarMap[boardColor] || "bg-indigo-500") : "bg-indigo-500");

  return (
    <div
      onClick={onClick}
      className={`group/card relative cursor-pointer rounded-xl border border-gray-200 border-l-4 ${borderAccent} bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-md`}
    >
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="absolute right-2 top-2 hidden rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 group-hover/card:flex"
          title="Delete card"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {showDeleteConfirm && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/95 p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <p className="mb-2 text-sm font-medium text-gray-900">Delete this card?</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete?.(card.id)}
                className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status badge + labels row */}
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.bg} ${status.text}`}>
          {isDone ? "Done" : status.label}
        </span>
        {card.labels.map((label) => (
          <span key={label.id} className={`${label.color} rounded-md px-2 py-0.5 text-[10px] font-medium text-white`}>
            {label.name}
          </span>
        ))}
      </div>

      <h4 className={`mb-2 font-medium ${isDone ? "text-gray-400 line-through" : "text-gray-900"}`}>{card.title}</h4>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-gray-500">Progress</span>
          <span className={`text-[10px] font-bold ${isDone ? "text-green-600" : "text-gray-600"}`}>{isDone ? "100" : progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${progressBarColor}`}
            style={{ width: `${isDone ? 100 : progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-3">
          {hasDueDate && dueDate && (
            <div
              className={`flex items-center gap-1 ${
                isOverdue ? "text-red-600" : isDueSoon ? "text-orange-600" : "text-gray-600"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">
                {dueDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
          {card.comments > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-xs">{card.comments}</span>
            </div>
          )}
          {(Array.isArray(card.attachments) ? card.attachments.length : card.attachments) > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" />
              <span className="text-xs">{Array.isArray(card.attachments) ? card.attachments.length : card.attachments}</span>
            </div>
          )}
        </div>

        {card.assignee && (
          <UserAvatar
            name={card.assignee.name}
            avatar={card.assignee.avatar}
            color={card.assignee.color}
            size="sm"
          >
            {onUnassign && (
              <button
                onClick={(e) => { e.stopPropagation(); onUnassign(card.id); }}
                className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm hover:bg-red-600 group-hover/avatar:flex"
                title="Unassign"
              >
                &times;
              </button>
            )}
          </UserAvatar>
        )}
      </div>
    </div>
  );
}
