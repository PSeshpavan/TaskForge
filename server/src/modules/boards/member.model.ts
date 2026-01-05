import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type MemberRole = "OWNER" | "EDITOR" | "VIEWER" | "MEMBER";

export interface IBoardMember extends Document {
  boardId: Types.ObjectId;
  userId: Types.ObjectId;
  role: MemberRole;
  createdAt: Date;
  updatedAt: Date;
}

const BoardMemberSchema = new Schema<IBoardMember>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["OWNER", "EDITOR", "VIEWER", "MEMBER"], default: "VIEWER" },
  },
  { timestamps: true }
);

// compound unique index
BoardMemberSchema.index({ boardId: 1, userId: 1 }, { unique: true });

export const BoardMember: Model<IBoardMember> =
  mongoose.models.BoardMember || mongoose.model<IBoardMember>("BoardMember", BoardMemberSchema);
