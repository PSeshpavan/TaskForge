import { Request, Response, NextFunction } from "express";
import {
  createTask,
  listTasksForBoard,
  getTaskById,
  getTaskAndAssertAccess,
  updateTask,
  deleteTask,
  reorderTasks,
} from "./tasks.service";
import { Task } from "./tasks.model";

function parseCsvQuery(value: unknown): string[] {
  const result: string[] = [];
  if (typeof value === "string") {
    return value
      .split(",")
      .map((label: string) => label.trim())
      .filter(Boolean);
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry === "string") {
        result.push(
          ...entry
            .split(",")
            .map((label: string) => label.trim())
            .filter(Boolean)
        );
      }
    }
  }
  return result;
}

function toTaskShape(t: any) {
  if (!t) return null;
  return {
    id: t._id?.toString() ?? t.id,
    boardId: t.boardId.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate ?? null,
    labels: t.labels ?? [],
    order: t.order ?? 0,
    createdBy: t.createdBy?.toString(),
    assignedTo: t.assignedTo ? t.assignedTo.toString() : null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export async function createTaskController(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { boardId } = req.params;
  console.log("[tasksController] createTaskController start", { userId, boardId, title: req.body.title });
  try {
    const task = await createTask(boardId, userId, req.body);
    console.log("[tasksController] createTaskController success", { taskId: task._id.toString() });
    return res.status(201).json({ task: toTaskShape(task) });
  } catch (err) {
    console.error("[tasksController] createTaskController error", err);
    next(err);
  }
}

export async function listTasksController(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { boardId } = req.params;
  console.log("[tasksController] listTasksController start", { userId, boardId });
  try {
    const labels = parseCsvQuery(req.query.labels);
    const tasks = await listTasksForBoard(userId, boardId, { labels: labels.length ? labels : undefined });
    const payload = tasks.map(toTaskShape);
    console.log("[tasksController] listTasksController success", { boardId, count: payload.length });
    return res.json({ tasks: payload });
  } catch (err) {
    console.error("[tasksController] listTasksController error", err);
    next(err);
  }
}

export async function patchTaskController(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { taskId } = req.params;
  console.log("[tasksController] patchTaskController start", { userId, taskId });
  try {
    const updated = await updateTask(userId, taskId, req.body);
    console.log("[tasksController] patchTaskController success", { taskId });
    return res.json({ task: toTaskShape(updated) });
  } catch (err) {
    console.error("[tasksController] patchTaskController error", err);
    next(err);
  }
}

export async function deleteTaskController(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { taskId } = req.params;
  console.log("[tasksController] deleteTaskController start", { userId, taskId });
  try {
    await deleteTask(userId, taskId);
    console.log("[tasksController] deleteTaskController success", { taskId });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[tasksController] deleteTaskController error", err);
    next(err);
  }
}

// export async function reorderTasksController(req: Request, res: Response, next: NextFunction) {
//   const func = "[tasksController] reorderTasksController";
//   const userId = (req as any).user.id;
//   const { boardId } = req.params;
//   const { updates } = req.body;
//   console.log(`${func} start`, { userId, boardId, count: updates?.length });
//   try {
//     const { assertBoardAccess } = await import("../boards/boards.service");
//     await assertBoardAccess(userId, boardId);
//     await reorderTasks(boardId, updates);
//     console.log(`${func} success`, { boardId, count: updates.length });
//     return res.json({ ok: true });
//   } catch (err) {
//     console.error(`${func} error`, err);
//     next(err);
//   }
// }
export async function reorderTasksController(req: Request, res: Response, next: NextFunction) {
  const func = "[tasksController] reorderTasksController";
  try {
    const { boardId } = req.params;
    const userId = (req as any).user.id;
    const { updates } = req.body as {
      updates: { taskId: string; status: "TODO" | "DOING" | "DONE"; order: number }[];
    };

    console.log(func, "start", { boardId, userId, count: updates.length });

    await reorderTasks(userId, boardId, updates);

    console.log(func, "success", { boardId, count: updates.length });
    return res.json({ ok: true });
  } catch (err) {
    console.error(func, "error", err);
    next(err);
  }
}

export async function updateTaskStatusController(req: Request, res: Response, next: NextFunction) {
  const func = "[tasksController] updateTaskStatusController";
  const { boardId, taskId } = req.params;
  const { status, order } = req.body as { status?: "TODO" | "DOING" | "DONE"; order?: number };

  console.log(`${func} start`, { boardId, taskId, status, order });

  try {
    const userId = (req as any).user.id;

    const { assertBoardRole } = await import("../boards/boards.service");
    await assertBoardRole(userId, boardId, ["OWNER", "EDITOR"]);

    const payload: Record<string, any> = {};
    if (status) payload.status = status;
    if (typeof order === "number") payload.order = order;
    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updated = await Task.findOneAndUpdate({ _id: taskId, boardId }, { $set: payload }, { new: true }).exec();

    if (!updated) {
      console.log(`${func} notFound`, { boardId, taskId });
      return res.status(404).json({ message: "Task not found" });
    }

    console.log(`${func} success`, { boardId, taskId, status: updated.status, order: updated.order });
    return res.json({ task: updated });
  } catch (err) {
    console.error(`${func} error`, err);
    next(err);
  }
}
