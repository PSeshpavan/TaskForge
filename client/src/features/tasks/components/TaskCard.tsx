import React, { useState } from "react";
import type { Task } from "../types";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { useDispatch } from "react-redux";
import { showToast } from "../../../ui/uiSlice";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Edit2, Calendar, GripVertical } from "lucide-react";

const statusOrder: Task["status"][] = ["TODO", "DOING", "DONE"];

export const TaskCard: React.FC<{ task: Task; onOpen: (id: string) => void; boardId: string }> = ({
  task,
  onOpen,
  boardId,
}) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const update = useUpdateTask(boardId);
  const [error, setError] = useState<string | null>(null);

  const tasks = queryClient.getQueryData<{ tasks: Task[] }>(["tasks", boardId])?.tasks ?? [];

  const statusIndex = statusOrder.indexOf(task.status);
  const canMoveBackward = statusIndex > 0;
  const canMoveForward = statusIndex < statusOrder.length - 1;

  const getNextOrder = (status: Task["status"]) => {
    const items = tasks.filter((item) => item.status === status);
    const maxOrder = items.reduce((acc, item) => Math.max(acc, item.order ?? 0), 0);
    return maxOrder + 1000;
  };

  const handleMove = async (direction: "forward" | "backward") => {
    const targetIndex = direction === "forward" ? statusIndex + 1 : statusIndex - 1;
    if (targetIndex < 0 || targetIndex >= statusOrder.length) return;
    const targetStatus = statusOrder[targetIndex];
    setError(null);
    try {
      await update.mutateAsync({
        taskId: task.id,
        body: {
          status: targetStatus,
          order: getNextOrder(targetStatus),
        },
      });
      dispatch(showToast({ message: `Moved to ${targetStatus}`, variant: "info" }));
    } catch (err) {
      const apiError = err as Error;
      setError(apiError.message);
    }
  };

  return (
    <div
      className="group relative flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg transition hover:border-sky-500/30 hover:bg-slate-900/80 cursor-pointer"
      onClick={() => onOpen(task.id)}
    >
      <div className="flex items-center justify-between gap-3">
        <Badge variant={task.priority === "HIGH" ? "danger" : task.priority === "MEDIUM" ? "warning" : "primary"}>
          {task.priority}
        </Badge>
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleMove("backward");
            }}
            disabled={!canMoveBackward || update.isPending}
            className="rounded-full border border-slate-700/60 bg-black/30 p-1 text-slate-400 hover:border-slate-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleMove("forward");
            }}
            disabled={!canMoveForward || update.isPending}
            className="rounded-full border border-slate-700/60 bg-black/30 p-1 text-slate-400 hover:border-slate-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen(task.id);
            }}
            className="rounded-full border border-slate-700/60 bg-black/30 p-1 text-slate-400 hover:border-slate-500 hover:text-white"
          >
            <Edit2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white">{task.title}</h3>
        <p className="text-xs leading-relaxed text-slate-400 line-clamp-2">
          {task.description || "No description yet."}
        </p>
      </div>

      {task.labels?.length ? (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label}
              className="rounded-xl border border-slate-700/80 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300"
            >
              #{label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between border-t border-slate-800/30 pt-3 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
        </div>
        <GripVertical size={14} className="text-slate-600 opacity-50" />
      </div>

      {error && <p className="text-[10px] text-rose-400">{error}</p>}
    </div>
  );
};
