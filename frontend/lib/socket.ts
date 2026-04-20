"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

import { getBackendUrl } from "@/lib/utils";

let globalSocket: Socket | null = null;

export function getSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io(getBackendUrl(), {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }
  return globalSocket;
}

export interface BoardEvents {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCardAdded?: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCardUpdated?: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCardMoved?: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCardDeleted?: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onColumnAdded?: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onColumnRenamed?: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onColumnDeleted?: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBackgroundChanged?: (data: any) => void;
}

export function useBoardSocket(boardId: string, events: BoardEvents) {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    if (!boardId) return;

    const socket = getSocket();

    // Send userId so the server can track presence
    let userId: string | null = null;
    try {
      // authentication uses `taskflow_user` as the key
      userId = JSON.parse(localStorage.getItem("taskflow_user") || "{}").id || null;
    } catch {
      /* ignore */
    }

    // Debug: log join attempt
    // eslint-disable-next-line no-console
    console.log("[socket] emitting join-board", { boardId, userId });

    socket.emit("join-board", boardId, userId);

    const onCardAdded = (d: unknown) => eventsRef.current.onCardAdded?.(d);
    const onCardUpdated = (d: unknown) => eventsRef.current.onCardUpdated?.(d);
    const onCardMoved = (d: unknown) => eventsRef.current.onCardMoved?.(d);
    const onCardDeleted = (d: unknown) => eventsRef.current.onCardDeleted?.(d);
    const onColumnAdded = (d: unknown) => eventsRef.current.onColumnAdded?.(d);
    const onColumnRenamed = (d: unknown) => eventsRef.current.onColumnRenamed?.(d);
    const onColumnDeleted = (d: unknown) => eventsRef.current.onColumnDeleted?.(d);
    const onBackgroundChanged = (d: unknown) => eventsRef.current.onBackgroundChanged?.(d);

    socket.on("board:card-added", onCardAdded);
    socket.on("board:card-updated", onCardUpdated);
    socket.on("board:card-moved", onCardMoved);
    socket.on("board:card-deleted", onCardDeleted);
    socket.on("board:column-added", onColumnAdded);
    socket.on("board:column-renamed", onColumnRenamed);
    socket.on("board:column-deleted", onColumnDeleted);
    socket.on("board:background-changed", onBackgroundChanged);

    return () => {
      socket.off("board:card-added", onCardAdded);
      socket.off("board:card-updated", onCardUpdated);
      socket.off("board:card-moved", onCardMoved);
      socket.off("board:card-deleted", onCardDeleted);
      socket.off("board:column-added", onColumnAdded);
      socket.off("board:column-renamed", onColumnRenamed);
      socket.off("board:column-deleted", onColumnDeleted);
      socket.off("board:background-changed", onBackgroundChanged);
      socket.emit("leave-board", boardId);
    };
  }, [boardId]);
}

export function useBoardPresence(boardId: string): string[] {
  const [activeUserIds, setActiveUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!boardId) return;

    const socket = getSocket();

    const onPresence = (data: { boardId: string; activeUserIds: string[] }) => {
      if (data.boardId === boardId) {
        // Debug: log incoming presence info
        // eslint-disable-next-line no-console
        console.log("[socket] received board:presence", data);

        setActiveUserIds(data.activeUserIds);
      }
    };

    socket.on("board:presence", onPresence);

    // Request current presence in case we missed the initial broadcast
    socket.emit("request-presence", boardId);

    return () => {
      socket.off("board:presence", onPresence);
    };
  }, [boardId]);

  return activeUserIds;
}

export interface DraggingCardInfo {
  title: string;
  labels: { name: string; color: string }[];
  progress: number;
  assignee?: { name: string; avatar: string; color: string };
}

export interface CursorData {
  userId: string;
  userName: string;
  userAvatar: string;
  userColor: string;
  x: number;
  y: number;
  draggingCard?: DraggingCardInfo;
}

export function useBoardCursors(boardId: string): { cursors: CursorData[]; emitCursor: (x: number, y: number, draggingCard?: DraggingCardInfo) => void } {
  const [cursors, setCursors] = useState<CursorData[]>([]);
  const cursorsRef = useRef<Map<string, CursorData & { ts: number }>>(new Map());

  useEffect(() => {
    if (!boardId) return;

    const socket = getSocket();

    const onCursorMove = (data: CursorData) => {
      cursorsRef.current.set(data.userId, { ...data, ts: Date.now() });
      setCursors(Array.from(cursorsRef.current.values()));
    };

    socket.on("board:cursor-move", onCursorMove);

    // Cleanup stale cursors every 3s
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      cursorsRef.current.forEach((v, k) => {
        if (now - v.ts > 5000) {
          cursorsRef.current.delete(k);
          changed = true;
        }
      });
      if (changed) setCursors(Array.from(cursorsRef.current.values()));
    }, 3000);

    return () => {
      socket.off("board:cursor-move", onCursorMove);
      clearInterval(interval);
    };
  }, [boardId]);

  const emitCursor = useCallback((x: number, y: number, draggingCard?: DraggingCardInfo) => {
    const socket = getSocket();
    let user: { id?: string; firstName?: string; lastName?: string; avatarColor?: string } = {};
    try {
      user = JSON.parse(localStorage.getItem("taskflow_user") || "{}");
    } catch { /* ignore */ }
    if (!user.id) return;

    const initials = `${(user.firstName?.[0] || "").toUpperCase()}${(user.lastName?.[0] || "").toUpperCase()}` || "??";
    socket.emit("cursor-move", {
      boardId,
      userId: user.id,
      userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      userAvatar: initials,
      userColor: user.avatarColor || "from-purple-500 to-purple-600",
      x,
      y,
      ...(draggingCard ? { draggingCard } : {}),
    });
  }, [boardId]);

  return { cursors, emitCursor };
}
