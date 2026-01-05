export type Activity = {
  id: string;
  boardId: string;
  actorId: string;
  type: string;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
};

export type ActivityListResponse = {
  activities: Activity[];
};
