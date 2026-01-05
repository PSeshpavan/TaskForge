import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IActivity extends Document {
  boardId: Types.ObjectId;
  actorId: Types.ObjectId;
  type: string;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);