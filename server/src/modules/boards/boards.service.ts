import { Board } from "./board.model";
import { BoardMember } from "./member.model";
import { User } from "../auth/user.model";
import { Types } from "mongoose";
import { logActivity } from "../activity/activity.service";

export type BoardRole = "OWNER" | "EDITOR" | "VIEWER" | "MEMBER";

export function normalizeRole(role?: string | null): BoardRole {
  if (!role) return "VIEWER";
  if (role === "MEMBER") return "EDITOR";
  if (role === "OWNER" || role === "EDITOR" || role === "VIEWER") return role;
  return "VIEWER";
}

export async function createBoard(name: string, ownerId: string) {
  const ownerOid = new Types.ObjectId(ownerId);
  const board = await Board.create({ name, ownerId: ownerOid });
  await BoardMember.create({ boardId: board._id, userId: ownerOid, role: "OWNER" });
  await logActivity({ boardId: board._id.toString(), actorId: ownerId, type: "BOARD_CREATED" });
  return board;
}

export async function listBoardsForUser(userId: string) {
  const oid = new Types.ObjectId(userId);
  const memberships = await BoardMember.find({ userId: oid }).lean().exec();
  const memberBoardIds = memberships.map((membership) => membership.boardId);
  const boards = await Board.find({
    $or: [{ ownerId: oid }, { _id: { $in: memberBoardIds } }],
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
  return { boards, memberships };
}

export async function getBoardWithMembers(boardId: string) {
  const board = await Board.findById(boardId).lean().exec();
  if (!board) return null;
  const members = await BoardMember.find({ boardId }).populate("userId").lean().exec();
  return { board, members };
}

export async function getUserBoardRole(userId: string, boardId: string): Promise<BoardRole | null> {
  const board = await Board.findById(boardId).lean().exec();
  if (!board) return null;
  if (board.ownerId.toString() === userId) return "OWNER";
  const member = await BoardMember.findOne({ boardId, userId }).lean().exec();
  if (!member) return null;
  return normalizeRole(member.role);
}

export async function assertBoardAccess(userId: string, boardId: string) {
  const board = await Board.findById(boardId).lean().exec();
  if (!board) throw Object.assign(new Error("Not Found"), { status: 404 });
  if (board.ownerId.toString() === userId) return "OWNER";
  const member = await BoardMember.findOne({ boardId, userId }).lean().exec();
  if (!member) throw Object.assign(new Error("Forbidden"), { status: 403 });
  return normalizeRole(member.role);
}

export async function assertBoardRole(userId: string, boardId: string, allowedRoles: BoardRole[]) {
  const role = await assertBoardAccess(userId, boardId);
  if (!allowedRoles.includes(role)) throw Object.assign(new Error("Forbidden"), { status: 403 });
  return role;
}

export async function assertOwner(userId: string, boardId: string) {
  await assertBoardRole(userId, boardId, ["OWNER"]);
  return true;
}

export async function updateBoardName(boardId: string, name: string) {
  const doc = await Board.findByIdAndUpdate(boardId, { name }, { new: true }).lean().exec();
  return doc;
}

export async function deleteBoardAndMembers(boardId: string) {
  await Board.deleteOne({ _id: boardId }).exec();
  await BoardMember.deleteMany({ boardId }).exec();
  // activities cleanup
  const { Activity } = await import("../activity/activity.model");
  await Activity.deleteMany({ boardId }).exec();
}

export async function addMemberByEmail(ownerId: string, boardId: string, email: string) {
  await assertBoardRole(ownerId, boardId, ["OWNER"]);
  const user = await User.findOne({ email }).exec();
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  try {
    const member = await BoardMember.create({
      boardId: new Types.ObjectId(boardId),
      userId: user._id,
      role: "VIEWER",
    });
    await logActivity({ boardId, actorId: ownerId, type: "MEMBER_ADDED", meta: { memberUserId: user._id.toString() } });
    return member;
  } catch (err: any) {
    // duplicate key -> idempotent: return existing
    if (err.code === 11000) {
      const existing = await BoardMember.findOne({ boardId, userId: user._id }).lean().exec();
      return existing;
    }
    throw err;
  }
}

export async function updateMemberRole(ownerId: string, boardId: string, memberId: string, role: BoardRole) {
  await assertBoardRole(ownerId, boardId, ["OWNER"]);
  const member = await BoardMember.findOne({ boardId, _id: memberId }).exec();
  if (!member) throw Object.assign(new Error("Member not found"), { status: 404 });
  if (member.role === "OWNER") throw Object.assign(new Error("Cannot change owner role"), { status: 403 });
  member.role = role;
  await member.save();
  return member;
}

export async function removeMember(ownerId: string, boardId: string, memberId: string) {
  await assertBoardRole(ownerId, boardId, ["OWNER"]);
  const member = await BoardMember.findOne({ boardId, _id: memberId }).exec();
  if (!member) throw Object.assign(new Error("Member not found"), { status: 404 });
  if (member.role === "OWNER") throw Object.assign(new Error("Cannot remove owner"), { status: 403 });
  await BoardMember.deleteOne({ _id: memberId }).exec();
  return true;
}
