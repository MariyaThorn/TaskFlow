"use client";

import { useState, useEffect } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import AddCardModal from "@/components/migrated/AddCardModal";
import KanbanCard from "@/components/migrated/KanbanCard";
import type { Card, Column, TeamMember, KanbanLabel } from "@/components/migrated/types";

interface KanbanColumnProps {
  column: Column;
  onCardClick: (card: Card, columnId: string) => void;
  onAddCard: (columnId: string, data: { title: string; description?: string; dueDate?: string; labels?: KanbanLabel[]; assignee?: TeamMember }) => void;
  members: TeamMember[];
  boardColor?: string;
}

export default function KanbanColumn({ column, onCardClick, onAddCard, members, boardColor }: KanbanColumnProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-80 shrink-0">
        <div className="flex h-full flex-col rounded-2xl bg-gray-100 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600">{column.cards.length}</span>
            </div>
          </div>
          <div className="mb-3 flex-1 space-y-3 overflow-y-auto">
            {column.cards.map((card) => (
              <KanbanCard key={card.id} card={card} columnId={column.id} columnTitle={column.title} boardColor={boardColor} onClick={() => onCardClick(card, column.id)} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 shrink-0">
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex h-full flex-col rounded-2xl bg-gray-100 p-4 transition-colors ${snapshot.isDraggingOver ? "bg-blue-100 ring-2 ring-blue-400" : ""}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600">{column.cards.length}</span>
              </div>
            </div>

            <div className="mb-3 flex-1 space-y-3 overflow-y-auto">
              {column.cards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? "opacity-70 rotate-2" : ""}
                    >
                      <KanbanCard card={card} columnId={column.id} columnTitle={column.title} boardColor={boardColor} onClick={() => onCardClick(card, column.id)} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>

            {showAddModal ? (
              <AddCardModal onClose={() => setShowAddModal(false)} onAdd={(data) => onAddCard(column.id, data)} members={members} />
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
        )}
      </Droppable>
    </div>
  );
}
