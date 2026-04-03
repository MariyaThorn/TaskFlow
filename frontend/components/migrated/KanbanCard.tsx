"use client";

import { useDrag } from "react-dnd";
import { Calendar, MessageSquare, Paperclip } from "lucide-react";
import type { Card } from "@/components/migrated/types";

interface KanbanCardProps {
  card: Card;
  columnId: string;
  onClick: () => void;
}

export default function KanbanCard({ card, columnId, onClick }: KanbanCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CARD",
    item: { id: card.id, columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const hasDueDate = Boolean(card.dueDate);
  const dueDate = hasDueDate ? new Date(card.dueDate) : null;
  const now = new Date();
  const soonThreshold = new Date(now);
  soonThreshold.setDate(soonThreshold.getDate() + 3);
  const isOverdue = dueDate ? dueDate < now : false;
  const isDueSoon = dueDate ? dueDate < soonThreshold : false;

  return (
    <div
      ref={(node) => {
        drag(node);
      }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-md ${
        isDragging ? "scale-105 rotate-2 opacity-50" : ""
      }`}
    >
      {card.labels.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {card.labels.map((label) => (
            <span key={label.id} className={`${label.color} rounded-lg px-2 py-1 text-xs font-medium text-white`}>
              {label.name}
            </span>
          ))}
        </div>
      )}

      <h4 className="mb-2 font-medium text-gray-900">{card.title}</h4>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-3">
          {hasDueDate && dueDate && (
            <div
              className={`flex items-center gap-1 ${
                isOverdue ? "text-red-600" : isDueSoon ? "text-orange-600" : "text-gray-600"
              }`}
            >
              <Calendar className="h-4 w-4" />
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
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">{card.comments}</span>
            </div>
          )}
          {card.attachments > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-4 w-4" />
              <span className="text-xs">{card.attachments}</span>
            </div>
          )}
        </div>

        {card.assignee && (
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${card.assignee.color} text-xs font-semibold text-white shadow-sm`}
            title={card.assignee.name}
          >
            {card.assignee.avatar}
          </div>
        )}
      </div>
    </div>
  );
}
