export type SafeUser = {
  id: string;
  name: string;
  email: string;
};

export type Board = { id: string; name: string; ownerId: string; createdAt: string; updatedAt: string };
export type BoardMember = {
  id: string;
  boardId: string;
  role: "OWNER" | "MEMBER";
  user: SafeUser;
};

export type BoardDetail = {
  board: Board;
  members: BoardMember[];
};
