import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format")
  .transform((s) => s);

export const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const boardIdParam = z.object({
  boardId: objectId,
});

export const boardMemberIdParam = z.object({
  boardId: objectId,
  memberId: objectId,
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]),
});

export const addMemberSchema = z.object({
  email: z.string().email("Invalid email"),
});
