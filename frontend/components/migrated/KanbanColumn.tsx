"use client";

import { useState } from "react";
import { useDrop } from "react-dnd";
import { Plus } from "lucide-react";
import AddCardModal from "@/components/migrated/AddCardModal";
import KanbanCard from "@/components/migrated/KanbanCard";
import type { Card, Column, TeamMember } from "@/components/migrated/types";

interface KanbanColumnProps {
  column: Column;
  onMoveCard: (cardId: string, sourceColumnId: string, targetColumnId: string) => void;
  onCardClick: (card: Card, columnId: string) => void;
  onAddCard: (columnId: string, title: string, assignee: TeamMember) => void;
  members: TeamMember[];
}

export default function KanbanColumn({ column, onMoveCard, onCardClick, onAddCard, members }: KanbanColumnProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "CARD",
    drop: (item: { id: string; columnId: string }) => {
      if (item.columnId !== column.id) {
        onMoveCard(item.id, item.columnId, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className="w-80 shrink-0">
      <div
        ref={(node) => {
          drop(node);
        }}
        className={`flex h-full flex-col rounded-2xl bg-gray-100 p-4 transition-colors ${isOver ? "bg-blue-100 ring-2 ring-blue-400" : ""}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600">{column.cards.length}</span>
          </div>
        </div>

        <div className="mb-3 flex-1 space-y-3 overflow-y-auto">
          {column.cards.map((card) => (
            <KanbanCard key={card.id} card={card} columnId={column.id} onClick={() => onCardClick(card, column.id)} />
          ))}
        </div>

        {showAddModal ? (
          <AddCardModal onClose={() => setShowAddModal(false)} onAdd={(title, assignee) => onAddCard(column.id, title, assignee)} members={members} />
        ) : (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" />
            <span>Add a card</span>
          </button>
        )}
      </div>
    </div>
  );
}
