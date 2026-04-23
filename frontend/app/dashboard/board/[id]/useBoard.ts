"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Card, Column, TeamMember, KanbanLabel } from "@/components/migrated/types";
import { getToken } from "@/lib/auth";
import { useBoardSocket } from "@/lib/socket";
import { getApiUrl, getBackendUrl } from "@/lib/utils";

const fallbackColors = [
  "from-blue-500 to-blue-600",
  "from-green-500 to-green-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-pink-600",
  "from-orange-500 to-orange-600",
  "from-teal-500 to-teal-600",
];

export function useBoard(boardId: string) {
  const [boardName, setBoardName] = useState("Board");
  const [boardColor, setBoardColor] = useState("from-blue-500 to-blue-600");
  const [boardBackgroundImage, setBoardBackgroundImage] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [columns, setColumns] = useState<Column[]>([]);
  const [projectMembers, setProjectMembers] = useState<TeamMember[]>([]);
  const [selectedCard, setSelectedCard] = useState<{
    card: Card;
    columnId: string;
    columnTitle: string;
  } | null>(null);

  const headers = useCallback((): Record<string, string> => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/boards/${boardId}`, {
        headers: headers(),
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      const b = data.board;
      setBoardName(b.name);
      setBoardColor(b.color || "from-blue-500 to-blue-600");
      const bgImg = b.backgroundImage || "";
      setBoardBackgroundImage(bgImg.startsWith("/uploads/") ? `${getBackendUrl()}${bgImg}` : bgImg);
      setProjectId(typeof b.project === "string" ? b.project : b.project?._id || "");
      if (data.project?.name) setProjectName(data.project.name);

      setColumns(
        b.columns.map((col: { _id: string; title: string; cards: Array<{ _id: string; title: string; description: string; dueDate: string; labels: Array<{ id: string; name: string; color: string }>; comments: number; attachments: Array<{ id?: string; _id?: string; name: string; originalName: string; url: string; size: number; uploadedAt: string }> | number; progress: number; assignee?: { name: string; avatar: string; color: string } }> }) => ({
          id: col._id,
          title: col.title,
          cards: col.cards.map((c) => ({
            id: c._id,
            title: c.title,
            description: c.description || "",
            dueDate: c.dueDate || "",
            labels: c.labels || [],
            comments: c.comments || 0,
            attachments: Array.isArray(c.attachments) ? c.attachments : [],
            progress: c.progress || 0,
            assignee: c.assignee?.name ? c.assignee : undefined,
          })),
        }))
      );

      if (data.project?.members) {
        const members: TeamMember[] = data.project.members
          .filter((m: { user: unknown }) => m.user)
          .map((m: { user: { _id: string; firstName: string; lastName: string; email: string; avatarColor?: string; profileImage?: string } }, i: number) => ({
            id: m.user._id,
            name: `${m.user.firstName} ${m.user.lastName}`.trim() || m.user.email,
            avatar: `${(m.user.firstName?.[0] || "").toUpperCase()}${(m.user.lastName?.[0] || "").toUpperCase()}` || m.user.email.substring(0, 2).toUpperCase(),
            color: m.user.avatarColor || fallbackColors[i % fallbackColors.length],
            profileImage: m.user.profileImage || "",
          }));
        setProjectMembers(members);
      }
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  // Real-time updates via WebSocket — refetch board on any remote change
  const pendingOp = useRef(false);
  const refetchIfNotLocal = useCallback(() => {
    if (pendingOp.current) {
      pendingOp.current = false;
      return; // skip — this was our own action
    }
    fetchBoard();
  }, [fetchBoard]);

  const handleBackgroundChanged = useCallback((data: { backgroundImage: string }) => {
    if (pendingOp.current) {
      pendingOp.current = false;
      return;
    }
    const bg = data.backgroundImage;
    if (bg && bg.startsWith("/uploads/")) {
      setBoardBackgroundImage(`${getBackendUrl()}${bg}`);
    } else {
      setBoardBackgroundImage(bg || "");
    }
  }, []);

  useBoardSocket(boardId, {
    onCardAdded: refetchIfNotLocal,
    onCardUpdated: refetchIfNotLocal,
    onCardMoved: refetchIfNotLocal,
    onCardDeleted: refetchIfNotLocal,
    onColumnAdded: refetchIfNotLocal,
    onColumnRenamed: refetchIfNotLocal,
    onColumnDeleted: refetchIfNotLocal,
    onBackgroundChanged: handleBackgroundChanged,
  });

  const moveCard = async (cardId: string, sourceColumnId: string, targetColumnId: string, sourceIndex: number, targetIndex: number) => {
    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => ({ ...col, cards: [...col.cards] }));
      const sourceColumn = newColumns.find((col) => col.id === sourceColumnId);
      const targetColumn = newColumns.find((col) => col.id === targetColumnId);
      if (!sourceColumn || !targetColumn) return prevColumns;
      const cardIndex = sourceColumn.cards.findIndex((card) => card.id === cardId);
      if (cardIndex === -1) return prevColumns;
      const [card] = sourceColumn.cards.splice(cardIndex, 1);
      targetColumn.cards.splice(targetIndex, 0, card);
      return newColumns;
    });

    try {
      pendingOp.current = true;
      const res = await fetch(`${getApiUrl()}/boards/${boardId}/cards/${cardId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers() },
        credentials: "include",
        body: JSON.stringify({ targetColumnId, targetIndex }),
      });
      if (!res.ok) fetchBoard();
    } catch {
      fetchBoard();
    }
  };

  const handleCardClick = (card: Card, columnId: string) => {
    setSelectedCard({
      card,
      columnId,
      columnTitle: columns.find((col) => col.id === columnId)?.title || "",
    });
  };

  const handleCardUpdate = async (updatedCard: Card) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
      })),
    );

    try {
      pendingOp.current = true;
      await fetch(`${getApiUrl()}/boards/${boardId}/cards/${updatedCard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers() },
        credentials: "include",
        body: JSON.stringify({
          title: updatedCard.title,
          description: updatedCard.description,
          dueDate: updatedCard.dueDate,
          labels: updatedCard.labels,
          assignee: updatedCard.assignee || null,
          progress: updatedCard.progress ?? 0,
        }),
      });
    } catch {
      fetchBoard();
    }
  };

  const handleAddCard = async (
    columnId: string,
    data: { title: string; description?: string; dueDate?: string; labels?: KanbanLabel[]; assignee?: TeamMember },
  ) => {
    try {
      pendingOp.current = true;
      const body: Record<string, unknown> = { columnId, title: data.title };
      if (data.description) body.description = data.description;
      if (data.dueDate) body.dueDate = data.dueDate;
      if (data.labels && data.labels.length > 0) body.labels = data.labels;
      if (data.assignee) {
        body.assignee = { name: data.assignee.name, avatar: data.assignee.avatar, color: data.assignee.color };
      }
      const res = await fetch(`${getApiUrl()}/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers() },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchBoard();
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      })),
    );
    setSelectedCard(null);

    try {
      pendingOp.current = true;
      await fetch(`${getApiUrl()}/boards/${boardId}/cards/${cardId}`, {
        method: "DELETE",
        headers: headers(),
        credentials: "include",
      });
    } catch {
      fetchBoard();
    }
  };

  const handleAddColumn = async (title: string) => {
    try {
      pendingOp.current = true;
      const res = await fetch(`${getApiUrl()}/boards/${boardId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers() },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const data = await res.json();
        setColumns((prev) => [...prev, { id: data.column._id, title: data.column.title, cards: [] }]);
      }
    } catch {
      // ignore
    }
  };

  const handleRenameColumn = async (columnId: string, title: string) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, title } : col)));
    try {
      pendingOp.current = true;
      await fetch(`${getApiUrl()}/boards/${boardId}/columns/${columnId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers() },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
    } catch {
      fetchBoard();
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
    try {
      pendingOp.current = true;
      await fetch(`${getApiUrl()}/boards/${boardId}/columns/${columnId}`, {
        method: "DELETE",
        headers: headers(),
        credentials: "include",
      });
    } catch {
      fetchBoard();
    }
  };

  return {
    boardName,
    boardColor,
    boardBackgroundImage,
    setBoardBackgroundImage,
    projectId,
    projectName,
    columns,
    projectMembers,
    selectedCard,
    setSelectedCard,
    moveCard,
    handleCardClick,
    handleCardUpdate,
    handleAddCard,
    handleDeleteCard,
    handleAddColumn,
    handleRenameColumn,
    handleDeleteColumn,
  };
}
