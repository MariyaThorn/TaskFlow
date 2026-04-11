"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3000";

let globalSocket: Socket | null = null;

function getSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io(SOCKET_URL, {
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
}

export function useBoardSocket(boardId: string, events: BoardEvents) {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    if (!boardId) return;

    const socket = getSocket();
    socket.emit("join-board", boardId);

    const onCardAdded = (d: unknown) => eventsRef.current.onCardAdded?.(d);
    const onCardUpdated = (d: unknown) => eventsRef.current.onCardUpdated?.(d);
    const onCardMoved = (d: unknown) => eventsRef.current.onCardMoved?.(d);
    const onCardDeleted = (d: unknown) => eventsRef.current.onCardDeleted?.(d);
    const onColumnAdded = (d: unknown) => eventsRef.current.onColumnAdded?.(d);
    const onColumnRenamed = (d: unknown) => eventsRef.current.onColumnRenamed?.(d);
    const onColumnDeleted = (d: unknown) => eventsRef.current.onColumnDeleted?.(d);

    socket.on("board:card-added", onCardAdded);
    socket.on("board:card-updated", onCardUpdated);
    socket.on("board:card-moved", onCardMoved);
    socket.on("board:card-deleted", onCardDeleted);
    socket.on("board:column-added", onColumnAdded);
    socket.on("board:column-renamed", onColumnRenamed);
    socket.on("board:column-deleted", onColumnDeleted);

    return () => {
      socket.off("board:card-added", onCardAdded);
      socket.off("board:card-updated", onCardUpdated);
      socket.off("board:card-moved", onCardMoved);
      socket.off("board:card-deleted", onCardDeleted);
      socket.off("board:column-added", onColumnAdded);
      socket.off("board:column-renamed", onColumnRenamed);
      socket.off("board:column-deleted", onColumnDeleted);
      socket.emit("leave-board", boardId);
    };
  }, [boardId]);
}
