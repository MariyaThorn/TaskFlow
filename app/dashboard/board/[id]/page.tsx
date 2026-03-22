"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Calendar, MessageSquare, Paperclip, MoreHorizontal } from "lucide-react";
import Navbar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";

// ── Types ──────────────────────────────────────────────────────────────────

type Label = {
  text: string;
  color: string;
  bg: string;
};

type Card = {
  id: number;
  title: string;
  labels: Label[];
  dueDate: string;
  comments: number;
  attachments: number;
  assignee: { initials: string; color: string } | null;
};

type Column = {
  id: number;
  title: string;
  cards: Card[];
};

// ── Seed data ─────────────────────────────────────────────────────────────

const INITIAL_COLUMNS: Column[] = [
  {
    id: 1,
    title: "To Do",
    cards: [
      {
        id: 1,
        title: "Design landing page",
        labels: [
          { text: "Design",       color: "#6D28D9", bg: "#EDE9FE" },
          { text: "High Priority", color: "#B91C1C", bg: "#FEE2E2" },
        ],
        dueDate: "Mar 10",
        comments: 3,
        attachments: 2,
        assignee: { initials: "SS", color: "#1D9E75" },
      },
      {
        id: 2,
        title: "Update documentation",
        labels: [
          { text: "Documentation", color: "#1D4ED8", bg: "#DBEAFE" },
        ],
        dueDate: "Mar 15",
        comments: 1,
        attachments: 0,
        assignee: { initials: "JD", color: "#534AB7" },
      },
    ],
  },
  {
    id: 2,
    title: "In Progress",
    cards: [
      {
        id: 3,
        title: "Implement authentication",
        labels: [
          { text: "Development",  color: "#065F46", bg: "#D1FAE5" },
          { text: "High Priority", color: "#B91C1C", bg: "#FEE2E2" },
        ],
        dueDate: "Mar 8",
        comments: 5,
        attachments: 1,
        assignee: { initials: "MC", color: "#7F77DD" },
      },
      {
        id: 4,
        title: "Setup CI/CD pipeline",
        labels: [
          { text: "DevOps", color: "#92400E", bg: "#FEF3C7" },
        ],
        dueDate: "Mar 12",
        comments: 2,
        attachments: 0,
        assignee: { initials: "EJ", color: "#D4537E" },
      },
    ],
  },
  {
    id: 3,
    title: "Review",
    cards: [
      {
        id: 5,
        title: "Code review for payment module",
        labels: [
          { text: "Development", color: "#065F46", bg: "#D1FAE5" },
          { text: "Testing",     color: "#B45309", bg: "#FEF3C7" },
        ],
        dueDate: "Mar 6",
        comments: 8,
        attachments: 3,
        assignee: { initials: "SS", color: "#1D9E75" },
      },
    ],
  },
  {
    id: 4,
    title: "Done",
    cards: [
      {
        id: 6,
        title: "Database migration",
        labels: [
          { text: "Database", color: "#1D4ED8", bg: "#DBEAFE" },
        ],
        dueDate: "Mar 1",
        comments: 4,
        attachments: 1,
        assignee: { initials: "JD", color: "#534AB7" },
      },
      {
        id: 7,
        title: "User testing feedback",
        labels: [
          { text: "Research", color: "#9D174D", bg: "#FCE7F3" },
        ],
        dueDate: "Mar 2",
        comments: 12,
        attachments: 5,
        assignee: { initials: "MC", color: "#7F77DD" },
      },
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────

function TaskCard({ card }: { card: Card }) {
  return (
    <div className="group rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-slate-300 transition cursor-pointer">
      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {card.labels.map((l) => (
            <span
              key={l.text}
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ color: l.color, backgroundColor: l.bg }}
            >
              {l.text}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-slate-800 leading-snug">{card.title}</p>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {card.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {card.dueDate}
            </span>
          )}
          {card.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {card.comments}
            </span>
          )}
          {card.attachments > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              {card.attachments}
            </span>
          )}
        </div>
        {card.assignee && (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: card.assignee.color }}
          >
            {card.assignee.initials}
          </div>
        )}
      </div>
    </div>
  );
}

function AddCardModal({
  onAdd,
  onClose,
}: {
  onAdd: (title: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-base font-semibold text-slate-900">Add a card</h3>
        <input
          autoFocus
          type="text"
          placeholder="Enter card title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && title.trim() && onAdd(title)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => title.trim() && onAdd(title)}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
          >
            Add Card
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function BoardPage() {
  const router = useRouter();
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingToColumn, setAddingToColumn] = useState<number | null>(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [isAddingList, setIsAddingList] = useState(false);

  const handleAddCard = (columnId: number, title: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: [
                ...col.cards,
                {
                  id: Date.now(),
                  title: title.trim(),
                  labels: [],
                  dueDate: "",
                  comments: 0,
                  attachments: 0,
                  assignee: null,
                },
              ],
            }
          : col
      )
    );
    setAddingToColumn(null);
  };

  const handleAddList = () => {
    if (!newListTitle.trim()) return;
    setColumns((prev) => [
      ...prev,
      { id: Date.now(), title: newListTitle.trim(), cards: [] },
    ]);
    setNewListTitle("");
    setIsAddingList(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeItem="Projects" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          userInitials="JD"
          notificationCount={2}
        />

        {/* Board header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Product Development</h1>
              <p className="text-xs text-slate-500">Track features and releases</p>
            </div>
          </div>
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Kanban board — horizontal scroll */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex h-full gap-4 p-6" style={{ minWidth: "max-content" }}>
            {columns.map((col) => (
              <div
                key={col.id}
                className="flex w-72 shrink-0 flex-col rounded-2xl bg-slate-100/80"
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">{col.title}</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                      {col.cards.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-2">
                  {col.cards.map((card) => (
                    <TaskCard key={card.id} card={card} />
                  ))}
                </div>

                {/* Add card button */}
                <button
                  onClick={() => setAddingToColumn(col.id)}
                  className="mx-3 mb-3 mt-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add a card
                </button>
              </div>
            ))}

            {/* Add another list */}
            <div className="w-72 shrink-0">
              {isAddingList ? (
                <div className="rounded-2xl bg-slate-100/80 p-3">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddList()}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleAddList}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
                    >
                      Add list
                    </button>
                    <button
                      onClick={() => { setIsAddingList(false); setNewListTitle(""); }}
                      className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingList(true)}
                  className="flex w-full items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-600 transition"
                >
                  <Plus className="h-4 w-4" />
                  Add another list
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {addingToColumn !== null && (
        <AddCardModal
          onAdd={(title) => handleAddCard(addingToColumn, title)}
          onClose={() => setAddingToColumn(null)}
        />
      )}
    </div>
  );
}
