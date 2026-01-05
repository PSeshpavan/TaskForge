import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

const statusEnum = z.enum(["TODO", "DOING", "DONE"]);
const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  dueDate: z
    .union([z.coerce.date(), z.null()])
    .optional()
    .transform((d) => (d === undefined ? null : d)),
  labels: z.array(z.string()).optional(),
  assignedTo: objectId.optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    dueDate: z.union([z.coerce.date(), z.null()]).optional(),
    labels: z.array(z.string()).optional(),
    assignedTo: objectId.optional().nullable(),
    order: z.number().int().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "At least one field must be provided" });

  export const boardTaskIdParam = z.object({
  boardId: z.string().min(1),
  taskId: z.string().min(1),
});

export const updateTaskStatusSchema = z.object({
  status: statusEnum.optional(),
  order: z.number().int().optional(),
});

export const reorderTasksSchema = z.object({
  updates: z
    .array(
      z.object({
        taskId: z.string().min(1),
        status: z.enum(["TODO", "DOING", "DONE"]),
        order: z.number(),
      })
    )
    .min(1),
});

export const boardIdParam = z.object({ boardId: objectId });
export const taskIdParam = z.object({ taskId: objectId });
