"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import KanbanColumn from "@/components/migrated/KanbanColumn";
import type { Card, Column, TeamMember, KanbanLabel } from "@/components/migrated/types";

interface KanbanBoardProps {
  columns: Column[];
  boardColor: string;
  backgroundImage?: string;
  projectMembers: TeamMember[];
  onMoveCard: (cardId: string, sourceColumnId: string, targetColumnId: string) => void;
  onCardClick: (card: Card, columnId: string) => void;
  onAddCard: (columnId: string, data: { title: string; description?: string; dueDate?: string; labels?: KanbanLabel[]; assignee?: TeamMember }) => void;
  onDeleteCard: (cardId: string) => void;
  onUnassignCard?: (cardId: string) => void;
  onAddColumn: (title: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

const bgTintMap: Record<string, string> = {
  "from-blue-500 to-blue-600": "bg-blue-50/60",
  "from-purple-500 to-purple-600": "bg-purple-50/60",
  "from-pink-500 to-pink-600": "bg-pink-50/60",
  "from-green-500 to-green-600": "bg-green-50/60",
  "from-orange-500 to-orange-600": "bg-orange-50/60",
  "from-red-500 to-red-600": "bg-red-50/60",
  "from-indigo-500 to-indigo-600": "bg-indigo-50/60",
  "from-teal-500 to-teal-600": "bg-teal-50/60",
};

export default function KanbanBoard({ columns, boardColor, backgroundImage, projectMembers, onMoveCard, onCardClick, onAddCard, onDeleteCard, onUnassignCard, onAddColumn, onRenameColumn, onDeleteColumn }: KanbanBoardProps) {
  const boardBg = backgroundImage ? "" : (bgTintMap[boardColor] || "bg-gray-50");
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const handleAddColumn = () => {
    const title = newColumnTitle.trim();
    if (!title) return;
    onAddColumn(title);
    setNewColumnTitle("");
    setAddingColumn(false);
  };

  return (
    <div
      className={`kanban-scroll relative min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-3 sm:p-6 lg:p-8 ${backgroundImage ? '' : boardBg}`}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(255,255,255,0.35), rgba(255,255,255,0.35)), url(${backgroundImage})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      } : undefined}
    >
      <div className="relative z-10 flex h-full min-w-max gap-3 sm:gap-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onCardClick={onCardClick}
            onAddCard={onAddCard}
            onDeleteCard={onDeleteCard}
            onUnassignCard={onUnassignCard}
            onDeleteColumn={onDeleteColumn}
            onRenameColumn={onRenameColumn}
            members={projectMembers}
            boardColor={boardColor}
          />
        ))}

        <div className="w-80 shrink-0">
          {addingColumn ? (
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <input
                type="text"
                placeholder="Enter list title..."
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddColumn(); if (e.key === "Escape") { setAddingColumn(false); setNewColumnTitle(""); } }}
                className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddColumn}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add list
                </button>
                <button
                  onClick={() => { setAddingColumn(false); setNewColumnTitle(""); }}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 p-4 text-gray-600 transition-colors hover:border-gray-400 hover:bg-white/80 hover:text-gray-900"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add another list</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
