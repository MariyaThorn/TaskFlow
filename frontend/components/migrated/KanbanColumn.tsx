"use client";

import { useState, useEffect } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react";
import AddCardModal from "@/components/migrated/AddCardModal";
import KanbanCard from "@/components/migrated/KanbanCard";
import type { Card, Column, TeamMember, KanbanLabel } from "@/components/migrated/types";

interface KanbanColumnProps {
  column: Column;
  onCardClick: (card: Card, columnId: string) => void;
  onAddCard: (columnId: string, data: { title: string; description?: string; dueDate?: string; labels?: KanbanLabel[]; assignee?: TeamMember }) => void;
  onDeleteCard?: (cardId: string) => void;
  onUnassignCard?: (cardId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onRenameColumn?: (columnId: string, title: string) => void;
  members: TeamMember[];
  boardColor?: string;
}

export default function KanbanColumn({ column, onCardClick, onAddCard, onDeleteCard, onUnassignCard, onDeleteColumn, onRenameColumn, members, boardColor }: KanbanColumnProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(column.title);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
              <KanbanCard key={card.id} card={card} columnId={column.id} columnTitle={column.title} boardColor={boardColor} onClick={() => onCardClick(card, column.id)} onDelete={onDeleteCard} onUnassign={onUnassignCard} />
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
                {renaming ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { onRenameColumn?.(column.id, renameValue.trim()); setRenaming(false); }
                        if (e.key === "Escape") { setRenaming(false); setRenameValue(column.title); }
                      }}
                      className="w-32 rounded border border-gray-300 px-2 py-0.5 text-sm font-semibold focus:border-blue-500 focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => { onRenameColumn?.(column.id, renameValue.trim()); setRenaming(false); }} className="rounded p-0.5 text-green-600 hover:bg-green-50"><Check className="h-4 w-4" /></button>
                    <button onClick={() => { setRenaming(false); setRenameValue(column.title); }} className="rounded p-0.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    <span className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600">{column.cards.length}</span>
                  </>
                )}
              </div>
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 z-20 w-40 rounded-lg bg-white py-1 shadow-lg ring-1 ring-gray-200">
                    <button
                      onClick={() => { setShowMenu(false); setRenaming(true); setRenameValue(column.title); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Rename
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); setConfirmDelete(true); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {confirmDelete && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="mb-2 text-xs text-red-700">Delete &quot;{column.title}&quot; and all its cards?</p>
                <div className="flex gap-2">
                  <button onClick={() => onDeleteColumn?.(column.id)} className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">Delete</button>
                  <button onClick={() => setConfirmDelete(false)} className="rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300">Cancel</button>
                </div>
              </div>
            )}

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
                      <KanbanCard card={card} columnId={column.id} columnTitle={column.title} boardColor={boardColor} onClick={() => onCardClick(card, column.id)} onDelete={onDeleteCard} onUnassign={onUnassignCard} />
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
