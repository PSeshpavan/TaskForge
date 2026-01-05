import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type TaskStatus = "TODO" | "DOING" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface ITask extends Document {
  boardId: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  order: number;
  labels: string[];
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String },
    status: { type: String, enum: ["TODO", "DOING", "DONE"], default: "TODO", index: true },
    order: { type: Number, required: true, default: 0, index: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM", index: true },
    dueDate: { type: Date, default: null, index: true },
    labels: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

TaskSchema.index({ boardId: 1, status: 1 });
TaskSchema.index({ boardId: 1, priority: 1 });
TaskSchema.index({ boardId: 1, dueDate: 1 });

export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
