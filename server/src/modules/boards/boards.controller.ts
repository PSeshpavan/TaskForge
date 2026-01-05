import { Request, Response, NextFunction } from "express";
import {
  createBoard,
  listBoardsForUser,
  getBoardWithMembers,
  updateBoardName,
  deleteBoardAndMembers,
  addMemberByEmail,
  updateMemberRole,
  removeMember,
  assertBoardAccess,
  assertOwner,
  getUserBoardRole,
  normalizeRole,
} from "./boards.service";
import { safeUser } from "../auth/auth.service";
import { User } from "../auth/user.model";

function toBoardShape(b: any) {
  return { id: b._id.toString(), name: b.name, ownerId: b.ownerId.toString(), createdAt: b.createdAt, updatedAt: b.updatedAt };
}

function toMemberShape(m: any) {
  const user = m.userId;
  const safe = user
    ? safeUser(user)
    : { id: m.userId?.toString() ?? "", name: "Unknown", email: "" };
  return {
    id: m._id.toString(),
    boardId: m.boardId.toString(),
    role: normalizeRole(m.role),
    user: safe,
  };
}

export async function createBoardController(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { name } = req.body;
  console.log("[boardsController] createBoardController start", { userId, name });
  try {
    const board = await createBoard(name, userId);
    console.log("[boardsController] createBoardController success", { boardId: board._id.toString() });
    return res.status(201).json({ board: toBoardShape(board) });
  } catch (err) {
    console.error("[boardsController] createBoardController error", err);
    next(err);
  }
}

export async function listBoardsController(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  console.log("[boardsController] listBoardsController start", { userId });
  try {
    const { boards, memberships } = await listBoardsForUser(userId);
    const ownerIds = Array.from(new Set(boards.map((board) => board.ownerId.toString())));
    const owners = await User.find({ _id: { $in: ownerIds } }).lean().exec();
    const ownerMap = new Map(owners.map((owner) => [owner._id.toString(), safeUser(owner)]));
    const membershipMap = new Map(memberships.map((m: any) => [m.boardId.toString(), m]));

    const payload = boards.map((board: any) => {
      const boardId = board._id.toString();
      const owner = ownerMap.get(board.ownerId.toString()) ?? {
        id: board.ownerId.toString(),
        name: "Unknown",
        email: "",
      };
      const isOwner = board.ownerId.toString() === userId;
      const memberRole = membershipMap.get(boardId)?.role;
      const myRole = isOwner ? "OWNER" : normalizeRole(memberRole);
      return {
        ...toBoardShape(board),
        owner,
        myRole,
      };
    });
    console.log("[boardsController] listBoardsController success", { count: payload.length });
    return res.json({ boards: payload });
  } catch (err) {
    console.error("[boardsController] listBoardsController error", err);
    next(err);
  }
}

export async function getBoardController(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { boardId } = req.params;
  console.log("[boardsController] getBoardController start", { userId, boardId });
  try {
    await assertBoardAccess(userId, boardId);
    const data = await getBoardWithMembers(boardId);
    if (!data) return res.status(404).json({ message: "Not Found" });
    const ownerDoc = await User.findById(data.board.ownerId).lean().exec();
    const owner = ownerDoc ? safeUser(ownerDoc) : null;
    const myRole = (await getUserBoardRole(userId, boardId)) ?? "VIEWER";
    const payload = {
      board: toBoardShape(data.board),
      owner,
      members: data.members.map((member) => ({
        ...toMemberShape(member),
        role: normalizeRole(member.role),
      })),
      myRole,
    };
    console.log("[boardsController] getBoardController success", { boardId, members: payload.members.length });
    return res.json(payload);
  } catch (err) {
    console.error("[boardsController] getBoardController error", err);
    next(err);
  }
}

export async function patchBoardController(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { boardId } = req.params;
  const { name } = req.body;
  console.log("[boardsController] patchBoardController start", { userId, boardId, name });
  try {
    await assertOwner(userId, boardId);
    const updated = await updateBoardName(boardId, name);
    if (!updated) return res.status(404).json({ message: "Not Found" });
    const payload = { board: toBoardShape(updated) };
    console.log("[boardsController] patchBoardController success", { boardId });
    return res.json(payload);
  } catch (err) {
    console.error("[boardsController] patchBoardController error", err);
    next(err);
  }
}

export async function deleteBoardController(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { boardId } = req.params;
  console.log("[boardsController] deleteBoardController start", { userId, boardId });
  try {
    await assertOwner(userId, boardId);
    await deleteBoardAndMembers(boardId);
    console.log("[boardsController] deleteBoardController success", { boardId });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[boardsController] deleteBoardController error", err);
    next(err);
  }
}

export async function addMemberController(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { boardId } = req.params;
  const { email } = req.body;
  console.log("[boardsController] addMemberController start", { userId, boardId, email });
  try {
    await addMemberByEmail(userId, boardId, email);
    const updated = await getBoardWithMembers(boardId);
    if (!updated) return res.status(404).json({ message: "Board not found" });
    const members = updated.members.map(toMemberShape);
    console.log("[boardsController] addMemberController success", { boardId, count: members.length });
    return res.json({ members });
  } catch (err) {
    console.error("[boardsController] addMemberController error", err);
    next(err);
  }
}

export async function updateMemberController(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { boardId, memberId } = req.params;
  const { role } = req.body;
  console.log("[boardsController] updateMemberController start", { userId, boardId, memberId, role });
  try {
    await updateMemberRole(userId, boardId, memberId, role);
    const updated = await getBoardWithMembers(boardId);
    if (!updated) return res.status(404).json({ message: "Board not found" });
    const members = updated.members.map((member) => ({ ...toMemberShape(member), role: normalizeRole(member.role) }));
    console.log("[boardsController] updateMemberController success", { boardId, count: members.length });
    return res.json({ members });
  } catch (err) {
    console.error("[boardsController] updateMemberController error", err);
    next(err);
  }
}

export async function removeMemberController(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { boardId, memberId } = req.params;
  console.log("[boardsController] removeMemberController start", { userId, boardId, memberId });
  try {
    await removeMember(userId, boardId, memberId);
    const updated = await getBoardWithMembers(boardId);
    if (!updated) return res.status(404).json({ message: "Board not found" });
    const members = updated.members.map(toMemberShape);
    console.log("[boardsController] removeMemberController success", { boardId, count: members.length });
    return res.json({ members });
  } catch (err) {
    console.error("[boardsController] removeMemberController error", err);
    next(err);
  }
}

