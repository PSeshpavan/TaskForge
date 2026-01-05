// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { tasksApi } from "../api/tasksApi";
// import type { Task } from "../types";

// type CreateTaskInput = {
//   title: string;
//   description?: string;
//   status?: "TODO" | "DOING" | "DONE";
//   priority?: "LOW" | "MEDIUM" | "HIGH";
//   dueDate?: string | null;
//   labels?: string[];
//   assignedTo?: string | null;
// };

// export function useCreateTask(boardId: string) {
//   const qc = useQueryClient();

//   return useMutation({
//     mutationFn: (body: CreateTaskInput) => tasksApi.create(boardId, body) as Promise<{ task: Task }>,
//     onSuccess: async () => {
//       await qc.invalidateQueries({ queryKey: ["tasks", boardId] });
//       await qc.invalidateQueries({ queryKey: ["activity", boardId] });
//     },
//   });
// }




import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasksApi";
import type { Task } from "../types";
import type { ApiError } from "../../../lib/apiClient";

type CreateTaskInput = {
  title: string;
  description?: string;
  status?: Task["status"]; // optional, default TODO
  priority?: Task["priority"];
  dueDate?: string | null;
  labels?: string[];
};

export function useCreateTask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskInput) => tasksApi.create(boardId, payload),

    onSuccess: (data) => {
      // ✅ adapt to your API response shape:
      const created: Task = (data as any)?.task ?? (data as any);

      queryClient.setQueryData<{ tasks: Task[] }>(["tasks", boardId], (old) => {
        const existing = old?.tasks ?? [];

        const createdId = (created as any).id ?? (created as any)._id;
        if (createdId && existing.some((t) => ((t as any).id ?? (t as any)._id) === createdId)) {
          return old ?? { tasks: existing };
        }

        const status = (created.status ?? "TODO") as Task["status"];

        // ensure order so it appears correctly in your column sort
        const maxOrder = existing
          .filter((t) => (t.status ?? "TODO") === status)
          .reduce((m, t) => Math.max(m, t.order ?? 0), 0);

        const withOrder: Task = {
          ...created,
          status,
          order: created.order ?? maxOrder + 1000,
        };

        return { ...(old ?? {}), tasks: [...existing, withOrder] };
      });

      // optional but recommended
      queryClient.invalidateQueries({ queryKey: ["activity", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },

    onError: (_err: ApiError) => {
      // nothing required here for this fix
    },
  });
}
