import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { validateBody } from "../../middleware/validateBody";
import { validateParams } from "../../middleware/validateParams";
import {
  createTaskSchema,
  boardIdParam,
  taskIdParam,
  updateTaskSchema,
  boardTaskIdParam,
  updateTaskStatusSchema,
  reorderTasksSchema,
} from "./tasks.validation";
import {
  createTaskController,
  listTasksController,
  patchTaskController,
  deleteTaskController,
  updateTaskStatusController,
  reorderTasksController,
} from "./tasks.controller";

const router = Router();

router.use(requireAuth);

// create task under board
router.post("/boards/:boardId/tasks", validateParams(boardIdParam), validateBody(createTaskSchema), createTaskController);

// list tasks for board
router.get("/boards/:boardId/tasks", validateParams(boardIdParam), listTasksController);

// reorder tasks within board
router.patch(
  "/boards/:boardId/tasks/reorder",
  requireAuth,
  validateParams(boardIdParam),
  validateBody(reorderTasksSchema),
  reorderTasksController
);

// patch task
router.patch("/tasks/:taskId", validateParams(taskIdParam), validateBody(updateTaskSchema), patchTaskController);

// delete task
router.delete("/tasks/:taskId", validateParams(taskIdParam), deleteTaskController);

router.patch(
  "/boards/:boardId/tasks/:taskId",
  requireAuth,
  validateParams(boardTaskIdParam),
  validateBody(updateTaskStatusSchema),
  updateTaskStatusController
);


export const tasksRouter = router;
