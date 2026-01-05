export type Task = {
  id: string;
  boardId: string;
  title: string;
  description?: string;
  status: "TODO" | "DOING" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
  labels: string[];
  createdBy: string;
  assignedTo?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  _id?: string;
};
