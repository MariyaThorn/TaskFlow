"use client";

import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, MoreHorizontal, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/searchbar";
import KanbanColumn from "@/components/migrated/KanbanColumn";
import CardDetailModal from "@/components/migrated/CardDetailModal";
import type { Card, Column, TeamMember } from "@/components/migrated/types";

const projectMembers: TeamMember[] = [
  { id: "1", name: "John Doe", avatar: "JD", color: "from-blue-500 to-blue-600" },
  { id: "2", name: "Sarah Smith", avatar: "SS", color: "from-purple-500 to-purple-600" },
  { id: "3", name: "Michael Chen", avatar: "MC", color: "from-green-500 to-green-600" },
  { id: "4", name: "Emily Johnson", avatar: "EJ", color: "from-orange-500 to-orange-600" },
];

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    cards: [
      {
        id: "1",
        title: "Design landing page",
        description: "Create mockups for the new landing page",
        dueDate: "2026-03-10",
        labels: [
          { id: "1", name: "Design", color: "bg-purple-500" },
          { id: "2", name: "High Priority", color: "bg-red-500" },
        ],
        comments: 3,
        attachments: 2,
        assignee: { name: "Sarah Smith", avatar: "SS", color: "from-purple-500 to-purple-600" },
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    cards: [
      {
        id: "3",
        title: "Implement authentication",
        description: "Add OAuth2 authentication flow",
        dueDate: "2026-03-08",
        labels: [
          { id: "4", name: "Development", color: "bg-green-500" },
          { id: "2", name: "High Priority", color: "bg-red-500" },
        ],
        comments: 5,
        attachments: 1,
        assignee: { name: "Michael Chen", avatar: "MC", color: "from-green-500 to-green-600" },
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    cards: [
      {
        id: "5",
        title: "Code review for payment module",
        description: "Review and test payment integration",
        dueDate: "2026-03-06",
        labels: [
          { id: "4", name: "Development", color: "bg-green-500" },
          { id: "6", name: "Testing", color: "bg-yellow-500" },
        ],
        comments: 8,
        attachments: 3,
        assignee: { name: "Sarah Smith", avatar: "SS", color: "from-purple-500 to-purple-600" },
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [
      {
        id: "6",
        title: "Database migration",
        description: "Migrate to PostgreSQL 15",
        dueDate: "2026-03-01",
        labels: [{ id: "7", name: "Database", color: "bg-indigo-500" }],
        comments: 4,
        attachments: 1,
        assignee: { name: "John Doe", avatar: "JD", color: "from-blue-500 to-blue-600" },
      },
    ],
  },
];

export default function BoardPage() {
  const router = useRouter();
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [selectedCard, setSelectedCard] = useState<{
    card: Card;
    columnId: string;
    columnTitle: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const moveCard = (cardId: string, sourceColumnId: string, targetColumnId: string) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const sourceColumn = newColumns.find((col) => col.id === sourceColumnId);
      const targetColumn = newColumns.find((col) => col.id === targetColumnId);

      if (!sourceColumn || !targetColumn) return prevColumns;

      const cardIndex = sourceColumn.cards.findIndex((card) => card.id === cardId);
      if (cardIndex === -1) return prevColumns;

      const [card] = sourceColumn.cards.splice(cardIndex, 1);
      targetColumn.cards.push(card);
      return newColumns;
    });
  };

  const handleCardClick = (card: Card, columnId: string) => {
    setSelectedCard({
      card,
      columnId,
      columnTitle: columns.find((col) => col.id === columnId)?.title || "",
    });
  };

  const handleCardUpdate = (updatedCard: Card) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
      })),
    );
  };

  const handleAddCard = (columnId: string, title: string, assignee: TeamMember) => {
    const newCard: Card = {
      id: Date.now().toString(),
      title,
      description: "",
      dueDate: "",
      labels: [],
      comments: 0,
      attachments: 0,
      assignee: {
        name: assignee.name,
        avatar: assignee.avatar,
        color: assignee.color,
      },
    };

    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === columnId ? { ...column, cards: [...column.cards, newCard] } : column,
      ),
    );
  };

  const handleDeleteCard = (cardId: string) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      })),
    );
    setSelectedCard(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeItem="Projects" />

        <div className="flex flex-1 flex-col">
          <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} notificationCount={2} />

          <div className="flex items-center justify-between border-b border-gray-200 bg-white/80 px-8 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard/project/1")}
                className="rounded-xl p-2 transition-colors hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Development</h1>
                <p className="text-sm text-gray-600">Track features and releases</p>
              </div>
            </div>
            <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
              <MoreHorizontal className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
            <div className="flex h-full min-w-max gap-6">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onMoveCard={moveCard}
                  onCardClick={handleCardClick}
                  onAddCard={handleAddCard}
                  members={projectMembers}
                />
              ))}

              <div className="w-80 shrink-0">
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 p-4 text-gray-600 transition-colors hover:border-gray-400 hover:bg-white/80 hover:text-gray-900">
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add another list</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedCard && (
          <CardDetailModal
            card={selectedCard.card}
            columnTitle={selectedCard.columnTitle}
            onClose={() => setSelectedCard(null)}
            onUpdate={handleCardUpdate}
            onDelete={handleDeleteCard}
          />
        )}
      </div>
    </DndProvider>
  );
}
