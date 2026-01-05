import { Task, TaskStatus } from "./tasks.model";
import { Types } from "mongoose";
import { assertBoardAccess as assertBoardAccessFromBoards } from "../boards/boards.service";
import { logActivity } from "../activity/activity.service";

type Update = { taskId: string; status: "TODO" | "DOING" | "DONE"; order: number };

export async function createTask(boardId: string, createdBy: string, data: any) {
  const status = data.status ?? "TODO";
  const maxOrder = await Task.findOne({ boardId, status }).sort({ order: -1 }).select("order").lean().exec();
  const computedOrder = (maxOrder?.order ?? 0) + 1000;
  const task = await Task.create({
    boardId: new Types.ObjectId(boardId),
    title: data.title,
    description: data.description,
    status,
    priority: data.priority ?? "MEDIUM",
    dueDate: data.dueDate ?? null,
    labels: data.labels ?? [],
    createdBy: new Types.ObjectId(createdBy),
    assignedTo: data.assignedTo ? new Types.ObjectId(data.assignedTo) : null,
    order: computedOrder,
  });
  await logActivity({ boardId, actorId: createdBy, type: "TASK_CREATED", meta: { taskId: task._id.toString(), title: task.title } });
  return task;
}

export async function listTasksForBoard(userId: string, boardId: string) {
  await assertBoardAccessFromBoards(userId, boardId);
  return Task.find({ boardId }).sort({ status: 1, order: 1, createdAt: 1 }).lean().exec();
}

export async function getTaskById(taskId: string) {
  return Task.findById(taskId).exec();
}

export async function getTaskAndAssertAccess(userId: string, taskId: string) {
  const task = await Task.findById(taskId).lean().exec();
  if (!task) throw Object.assign(new Error("Not Found"), { status: 404 });
  await assertBoardAccessFromBoards(userId, task.boardId.toString());
  return task;
}

export async function updateTask(userId: string, taskId: string, updates: any) {
  const existing = await Task.findById(taskId).exec();
  if (!existing) throw Object.assign(new Error("Not Found"), { status: 404 });
  await assertBoardAccessFromBoards(userId, existing.boardId.toString());

  const prevStatus = existing.status;
  const changed: string[] = [];

  const up: any = {};
  const fields: (keyof typeof updates)[] = ["title", "description", "status", "priority", "dueDate", "labels", "assignedTo", "order"];
  for (const f of fields) {
    if (Object.prototype.hasOwnProperty.call(updates, f)) {
      (up as any)[f] = updates[f];
      changed.push(String(f));
    }
  }

  Object.assign(existing, up);
  await existing.save();

  if (updates.status && updates.status !== prevStatus) {
    await logActivity({ boardId: existing.boardId.toString(), actorId: userId, type: "TASK_MOVED", meta: { taskId: existing._id.toString(), fromStatus: prevStatus, toStatus: updates.status } });
  } else {
    await logActivity({ boardId: existing.boardId.toString(), actorId: userId, type: "TASK_UPDATED", meta: { taskId: existing._id.toString(), fields: changed } });
  }

  return existing.toObject();
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await Task.findById(taskId).exec();
  if (!task) throw Object.assign(new Error("Not Found"), { status: 404 });
  await assertBoardAccessFromBoards(userId, task.boardId.toString());
  await Task.deleteOne({ _id: taskId }).exec();
  await logActivity({ boardId: task.boardId.toString(), actorId: userId, type: "TASK_DELETED", meta: { taskId } });
  return true;
}

// export async function reorderTasks(boardId: string, updates: { taskId: string; status: Task["status"]; order: number }[]) {
//   if (!updates.length) return;
//   const bulk = updates.map((update) => ({
//     updateOne: {
//       filter: { _id: new Types.ObjectId(update.taskId), boardId: new Types.ObjectId(boardId) },
//       update: {
//         $set: {
//           status: update.status,
//           order: update.order,
//         },
//       },
//     },
//   }));
//   await Task.bulkWrite(bulk);
//   return true;
// }

export async function reorderTasks(userId: string, boardId: string, updates: Update[]) {
  // Access check
  const { assertBoardAccess } = await import("../boards/boards.service");
  await assertBoardAccess(userId, boardId);

  const boardObjectId = new Types.ObjectId(boardId);

  const ops = updates.map((u) => ({
    updateOne: {
      filter: { _id: new Types.ObjectId(u.taskId), boardId: boardObjectId },
      update: { $set: { status: u.status, order: u.order } },
    },
  }));

  const result = await Task.bulkWrite(ops, { ordered: false });
  return result;
}