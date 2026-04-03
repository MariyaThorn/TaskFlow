export interface KanbanLabel {
  id: string;
  name: string;
  color: string;
}

export interface KanbanAssignee {
  name: string;
  avatar: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  labels: KanbanLabel[];
  comments: number;
  attachments: number;
  assignee?: KanbanAssignee;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  role: "admin" | "member";
  status: "active" | "pending";
}
