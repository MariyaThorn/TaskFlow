"use client";

import { useCallback, useEffect } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import CardDetailModal from "@/components/migrated/CardDetailModal";
import LiveCursors from "@/components/migrated/LiveCursors";
import { useBoardPresence, useBoardCursors } from "@/lib/socket";
import { useBoard } from "./useBoard";
import BoardHeader from "./BoardHeader";
import KanbanBoard from "./KanbanBoard";

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;

  const {
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
  } = useBoard(boardId);

  // Use the same key as authentication logic (taskflow_user)
  const currentUserId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("taskflow_user") || "{}").id : null;
  const activeUserIds = useBoardPresence(boardId);
  const { cursors, emitCursor } = useBoardCursors(boardId);

  // Track mouse movement on the board and emit cursor position
  useEffect(() => {
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, 50);
      emitCursor(e.clientX, e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [emitCursor]);

  // Debug log for presence troubleshooting
  if (typeof window !== "undefined") {
    console.log("[BoardPage] currentUserId:", currentUserId, "activeUserIds:", activeUserIds);
  }

  const onDragEnd = useCallback((result: DropResult) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    moveCard(draggableId, source.droppableId, destination.droppableId);
  }, [moveCard]);

  const handleUnassignCard = useCallback((cardId: string) => {
    // Find the card in columns and update it without assignee
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === cardId);
      if (card) {
        handleCardUpdate({ ...card, assignee: undefined });
        break;
      }
    }
  }, [columns, handleCardUpdate]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-screen overflow-hidden bg-[#f8f0ff]">
        <Sidebar activeItem="Projects" />
        <LiveCursors cursors={cursors.filter(c => c.userId !== currentUserId)} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <BoardHeader
            projectName={projectName}
            boardName={boardName}
            projectId={projectId}
            boardId={boardId}
            projectMembers={projectMembers}
            currentUserId={currentUserId}
            activeUserIds={activeUserIds}
            backgroundImage={boardBackgroundImage}
            onBackgroundChange={setBoardBackgroundImage}
          />

          <KanbanBoard
            columns={columns}
            boardColor={boardColor}
            backgroundImage={boardBackgroundImage}
            projectMembers={projectMembers}
            onMoveCard={moveCard}
            onCardClick={handleCardClick}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
            onUnassignCard={handleUnassignCard}
            onAddColumn={handleAddColumn}
            onRenameColumn={handleRenameColumn}
            onDeleteColumn={handleDeleteColumn}
          />
        </div>

        {selectedCard && (
          <CardDetailModal
            card={selectedCard.card}
            boardId={boardId}
            columnTitle={selectedCard.columnTitle}
            members={projectMembers}
            onClose={() => setSelectedCard(null)}
            onUpdate={handleCardUpdate}
            onDelete={handleDeleteCard}
          />
        )}
      </div>
    </DragDropContext>
  );
}
