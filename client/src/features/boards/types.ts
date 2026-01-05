export type SafeUser = {
  id: string;
  name: string;
  email: string;
};

export type BoardRole = "OWNER" | "EDITOR" | "VIEWER";

export type Board = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardSummary = Board & {
  owner: SafeUser;
  myRole: BoardRole;
};

export type BoardMember = {
  id: string;
  boardId: string;
  role: BoardRole;
  user: SafeUser;
};

export type BoardDetail = {
  board: Board;
  owner?: SafeUser | null;
  members: BoardMember[];
  myRole: BoardRole;
};

export type ManageableBoardRole = Extract<BoardRole, "EDITOR" | "VIEWER">;
