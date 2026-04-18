"use client";

import { useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import CardDetailModal from "@/components/migrated/CardDetailModal";
import { useBoardPresence } from "@/lib/socket";
import { useBoard } from "./useBoard";
import BoardHeader from "./BoardHeader";
import KanbanBoard from "./KanbanBoard";

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;

  const {
    boardName,
    boardColor,
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar activeItem="Projects" />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <BoardHeader
            projectName={projectName}
            boardName={boardName}
            projectId={projectId}
            projectMembers={projectMembers}
            currentUserId={currentUserId}
            activeUserIds={activeUserIds}
          />

          <KanbanBoard
            columns={columns}
            boardColor={boardColor}
            projectMembers={projectMembers}
            onMoveCard={moveCard}
            onCardClick={handleCardClick}
            onAddCard={handleAddCard}
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
            onClose={() => setSelectedCard(null)}
            onUpdate={handleCardUpdate}
            onDelete={handleDeleteCard}
          />
        )}
      </div>
    </DragDropContext>
  );
}
