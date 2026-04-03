"use client";

import { useState } from "react";
import { X, AlignLeft, Tag, Paperclip, MessageSquare, Trash2 } from "lucide-react";
import type { Card } from "@/components/migrated/types";

interface CardDetailModalProps {
  card: Card;
  columnTitle: string;
  onClose: () => void;
  onUpdate: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export default function CardDetailModal({ card, columnTitle, onClose, onUpdate, onDelete }: CardDetailModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [dueDate, setDueDate] = useState(card.dueDate);
  const [newComment, setNewComment] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onUpdate({
      ...card,
      title,
      description,
      dueDate,
    });
  };

  const handleDelete = () => {
    onDelete(card.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                className="-mx-2 w-full rounded border-none bg-transparent px-2 text-2xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
              <p className="mt-1 text-sm text-gray-600">
                in list <span className="font-medium">{columnTitle}</span>
              </p>
            </div>
            <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Labels</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {card.labels.map((label) => (
                    <span key={label.id} className={`${label.color} rounded-xl px-3 py-1 text-sm font-medium text-white`}>
                      {label.name}
                    </span>
                  ))}
                  <button className="rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                    + Add label
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <AlignLeft className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Description</h3>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSave}
                  placeholder="Add a more detailed description..."
                  className="min-h-[120px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Attachments</h3>
                </div>
                <button className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100">
                  Click to upload or drag and drop
                </button>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Comments</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-sm font-semibold text-white">
                      JD
                    </div>
                    <div className="flex-1">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">John Doe</span>
                          <span className="text-xs text-gray-500">2 hours ago</span>
                        </div>
                        <p className="text-sm text-gray-700">This looks great! Let&apos;s move forward with this approach.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-sm font-semibold text-white">
                      ME
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                        rows={3}
                      />
                      {newComment && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => setNewComment("")}
                            className="rounded-xl bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4338CA]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setNewComment("")}
                            className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">Due date</h4>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    onUpdate({ ...card, title, description, dueDate: e.target.value });
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</h4>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex w-full items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete card
                </button>
              </div>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 backdrop-blur-sm">
            <div className="m-6 max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Delete Card?</h3>
              <p className="mb-6 text-sm text-gray-600">
                Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                  Cancel
                </button>
                <button onClick={handleDelete} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">
                  Delete Card
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
