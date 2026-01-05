import { Activity } from "./activity.model";
import { Types } from "mongoose";

export async function logActivity(params: {
  boardId: string;
  actorId: string;
  type: string;
  meta?: Record<string, any>;
}) {
  const doc = await Activity.create({
    boardId: new Types.ObjectId(params.boardId),
    actorId: new Types.ObjectId(params.actorId),
    type: params.type,
    meta: params.meta || {},
  });
  return doc;
}

export async function getActivities(boardId: string, limit = 20) {
  return Activity.find({ boardId }).sort({ createdAt: -1 }).limit(limit).lean().exec();
}