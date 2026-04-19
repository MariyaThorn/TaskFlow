"use client";

import { useState, useRef } from "react";
import { X, AlignLeft, Tag, Paperclip, MessageSquare, Trash2, FileText, Download, User } from "lucide-react";
import type { Card, KanbanLabel, KanbanAttachment, TeamMember } from "@/components/migrated/types";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

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
  members?: TeamMember[];
  onClose: () => void;
  onUpdate: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export default function CardDetailModal({ card, boardId, columnTitle, members = [], onClose, onUpdate, onDelete }: CardDetailModalProps) {
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
  const [assignee, setAssignee] = useState<{ name: string; avatar: string; color: string } | undefined>(card.assignee);
  const [showAssigneeList, setShowAssigneeList] = useState(false);
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
      assignee,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#faf5ff] shadow-2xl ring-1 ring-[#e0aaff]/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#e0aaff]/30 bg-[#ede0ff] p-4 sm:p-6 rounded-t-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                className="-mx-2 w-full rounded border-none bg-transparent px-2 text-2xl font-semibold text-[#3c096c] focus:outline-none focus:ring-2 focus:ring-[#5a189a]"
              />
              <p className="mt-1 text-sm text-[#5a189a]/60">
                in list <span className="font-medium text-[#5a189a]">{columnTitle}</span>
              </p>
            </div>
            <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-[#5a189a]/10">
              <X className="h-5 w-5 text-[#5a189a]" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-[#5a189a]" />
                  <h3 className="font-semibold text-[#3c096c]">Labels</h3>
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
                    <div className="flex w-full flex-col gap-2 rounded-xl border border-[#e0aaff]/30 bg-[#f8f0ff] p-3">
                      <input
                        type="text"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        placeholder="Label name..."
                        className="rounded-lg border border-[#e0aaff]/40 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a189a]"
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
                          className="rounded-lg bg-[#5a189a] px-3 py-1 text-sm font-medium text-white hover:bg-[#3c096c] disabled:opacity-50"
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
                      className="rounded-xl bg-[#ede0ff] px-3 py-1 text-sm font-medium text-[#5a189a] transition-colors hover:bg-[#e0aaff]/40"
                    >
                      + Add label
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <AlignLeft className="h-5 w-5 text-[#5a189a]" />
                  <h3 className="font-semibold text-[#3c096c]">Description</h3>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSave}
                  placeholder="Add a more detailed description..."
                  className="min-h-[120px] w-full resize-none rounded-xl border border-[#e0aaff]/30 bg-white p-3 text-[#3c096c] placeholder:text-[#5a189a]/30 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-[#5a189a]" />
                  <h3 className="font-semibold text-[#3c096c]">Attachments</h3>
                </div>
                {attachments.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {attachments.map((att) => (
                      <div key={att.id || (att as { _id?: string })._id} className="flex items-center gap-3 rounded-xl border border-[#e0aaff]/30 bg-white p-3">
                        <FileText className="h-8 w-8 shrink-0 text-[#9d4edd]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#3c096c]">{att.originalName}</p>
                          <p className="text-xs text-[#5a189a]/50">{formatFileSize(att.size)}</p>
                        </div>
                        <a
                          href={`${API_URL?.replace('/api', '') ?? ''}${att.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1.5 text-[#5a189a]/40 hover:bg-[#ede0ff] hover:text-[#5a189a]"
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
                  className="w-full rounded-xl border-2 border-dashed border-[#e0aaff]/50 bg-white px-4 py-3 text-sm font-medium text-[#5a189a] transition-colors hover:bg-[#ede0ff] hover:border-[#9d4edd] disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                </button>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#5a189a]" />
                  <h3 className="font-semibold text-[#3c096c]">Comments</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5a189a] to-[#9d4edd] text-sm font-semibold text-white">
                      ME
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full resize-none rounded-xl border border-[#e0aaff]/30 bg-white p-3 text-[#3c096c] placeholder:text-[#5a189a]/30 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]"
                        rows={3}
                      />
                      {newComment && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => setNewComment("")}
                            className="rounded-xl bg-[#5a189a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3c096c]"
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
              {/* Assignee */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#5a189a]/70">Assignee</h4>
                {assignee ? (
                  <div className="flex items-center gap-2 rounded-xl bg-white border border-[#e0aaff]/30 p-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${assignee.color} text-xs font-semibold text-white`}>
                      {assignee.avatar}
                    </div>
                    <span className="flex-1 truncate text-sm font-medium text-[#3c096c]">{assignee.name}</span>
                    <button
                      onClick={() => { setAssignee(undefined); setTimeout(handleSave, 0); }}
                      className="text-xs text-[#5a189a]/50 hover:text-[#5a189a]"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAssigneeList(!showAssigneeList)}
                    className="flex w-full items-center gap-2 rounded-xl border border-[#e0aaff]/30 bg-white px-3 py-2 text-sm font-medium text-[#5a189a]/60 transition-colors hover:bg-[#ede0ff]"
                  >
                    <User className="h-4 w-4" />
                    Assign member
                  </button>
                )}
                {showAssigneeList && !assignee && members.length > 0 && (
                  <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-[#e0aaff]/30 bg-white p-2">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          const a = { name: m.name, avatar: m.avatar, color: m.color };
                          setAssignee(a);
                          setShowAssigneeList(false);
                          onUpdate({ ...card, title, description, dueDate, progress, labels, attachments, assignee: a });
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[#f8f0ff]"
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${m.color} text-xs font-semibold text-white`}>
                          {m.avatar}
                        </div>
                        <span className="truncate text-sm text-[#3c096c]">{m.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#5a189a]/70">Progress</h4>
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
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e0aaff]/30 accent-[#5a189a]"
                  />
                  <span className="min-w-[3ch] text-right text-sm font-bold text-[#3c096c]">{progress}%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#e0aaff]/20">
                  <div className="h-full rounded-full bg-[#5a189a] transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#5a189a]/70">Due date</h4>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    onUpdate({ ...card, title, description, dueDate: e.target.value, progress });
                  }}
                  className="w-full rounded-xl border border-[#e0aaff]/30 bg-white px-3 py-2 text-sm text-[#3c096c] focus:outline-none focus:ring-2 focus:ring-[#5a189a]"
                />
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#5a189a]/70">Actions</h4>
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
            <div className="m-6 max-w-md rounded-xl bg-[#faf5ff] p-6 shadow-2xl ring-1 ring-[#e0aaff]/30">
              <h3 className="mb-2 text-lg font-semibold text-[#3c096c]">Delete Card?</h3>
              <p className="mb-6 text-sm text-[#5a189a]/60">
                Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="rounded-xl bg-[#ede0ff] px-4 py-2 text-sm font-medium text-[#5a189a] transition-colors hover:bg-[#e0aaff]/40">
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
