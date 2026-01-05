import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IBoard extends Document {
  name: string;
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema = new Schema<IBoard>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

export const Board: Model<IBoard> = mongoose.models.Board || mongoose.model<IBoard>("Board", BoardSchema);