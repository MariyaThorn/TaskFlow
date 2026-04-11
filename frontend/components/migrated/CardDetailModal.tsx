"use client";

import { useState, useRef } from "react";
import { X, AlignLeft, Tag, Paperclip, MessageSquare, Trash2, FileText, Download } from "lucide-react";
import type { Card, KanbanLabel, KanbanAttachment } from "@/components/migrated/types";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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

interface CardDetailModalProps {
  card: Card;
  boardId: string;
  columnTitle: string;
  onClose: () => void;
  onUpdate: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export default function CardDetailModal({ card, boardId, columnTitle, onClose, onUpdate, onDelete }: CardDetailModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [dueDate, setDueDate] = useState(card.dueDate);
  const [progress, setProgress] = useState(card.progress ?? 0);
  const [labels, setLabels] = useState<KanbanLabel[]>(card.labels || []);
  const [attachments, setAttachments] = useState<KanbanAttachment[]>(
    Array.isArray(card.attachments) ? card.attachments : []
  );
  const [newComment, setNewComment] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0].value);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate({
      ...card,
      title,
      description,
      dueDate,
      progress,
      labels,
      attachments,
    });
  };

  const handleDelete = () => {
    onDelete(card.id);
    onClose();
  };

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;
    const newLabel: KanbanLabel = {
      id: `label-${Date.now()}`,
      name: newLabelName.trim(),
      color: newLabelColor,
    };
    const updatedLabels = [...labels, newLabel];
    setLabels(updatedLabels);
    setNewLabelName("");
    setShowLabelForm(false);
    onUpdate({
      ...card,
      title,
      description,
      dueDate,
      progress,
      labels: updatedLabels,
      attachments,
    });
  };

  const handleRemoveLabel = (labelId: string) => {
    const updatedLabels = labels.filter((l) => l.id !== labelId);
    setLabels(updatedLabels);
    onUpdate({
      ...card,
      title,
      description,
      dueDate,
      progress,
      labels: updatedLabels,
      attachments,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = getToken();
      const res = await fetch(`${API_URL}/boards/${boardId}/cards/${card.id}/attachments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const updatedAttachments = [...attachments, data.attachment];
        setAttachments(updatedAttachments);
        onUpdate({
          ...card,
          title,
          description,
          dueDate,
          progress,
          labels,
          attachments: updatedAttachments,
        });
      }
    } catch {
      // ignore
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const token = getToken();
      await fetch(`${API_URL}/boards/${boardId}/cards/${card.id}/attachments/${attachmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const updatedAttachments = attachments.filter(
        (a) => a.id !== attachmentId && (a as { _id?: string })._id !== attachmentId
      );
      setAttachments(updatedAttachments);
      onUpdate({
        ...card,
        title,
        description,
        dueDate,
        progress,
        labels,
        attachments: updatedAttachments,
      });
    } catch {
      // ignore
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
                  {labels.map((label) => (
                    <span
                      key={label.id}
                      className={`${label.color} group relative rounded-xl px-3 py-1 text-sm font-medium text-white cursor-pointer`}
                      onClick={() => handleRemoveLabel(label.id)}
                      title="Click to remove"
                    >
                      {label.name}
                      <span className="ml-1 hidden group-hover:inline">&times;</span>
                    </span>
                  ))}
                  {showLabelForm ? (
                    <div className="flex w-full flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <input
                        type="text"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        placeholder="Label name..."
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddLabel();
                          if (e.key === "Escape") setShowLabelForm(false);
                        }}
                      />
                      <div className="flex flex-wrap gap-1.5">
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
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddLabel}
                          disabled={!newLabelName.trim()}
                          className="rounded-lg bg-[#4F46E5] px-3 py-1 text-sm font-medium text-white hover:bg-[#4338CA] disabled:opacity-50"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setShowLabelForm(false); setNewLabelName(""); }}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowLabelForm(true)}
                      className="rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      + Add label
                    </button>
                  )}
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
                {attachments.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {attachments.map((att) => (
                      <div key={att.id || (att as { _id?: string })._id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <FileText className="h-8 w-8 shrink-0 text-gray-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{att.originalName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(att.size)}</p>
                        </div>
                        <a
                          href={`${API_URL.replace('/api', '')}${att.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteAttachment(att.id || (att as { _id?: string })._id || "")}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Click to upload or drag and drop"}
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
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">Progress</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    onMouseUp={handleSave}
                    onTouchEnd={handleSave}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#4F46E5]"
                  />
                  <span className="min-w-[3ch] text-right text-sm font-bold text-gray-700">{progress}%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#4F46E5] transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">Due date</h4>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    onUpdate({ ...card, title, description, dueDate: e.target.value, progress });
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
