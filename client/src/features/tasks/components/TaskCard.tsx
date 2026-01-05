import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Task } from "../types";
import { Badge } from "../../../components/Badge";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { useDispatch } from "react-redux";
import { showToast } from "../../../ui/uiSlice";
import { useQueryClient } from "@tanstack/react-query";
import type { BoardMember } from "../../boards/types";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Edit2,
  GripVertical,
  Search,
  UserPlus2,
  X,
} from "lucide-react";

const statusOrder: Task["status"][] = ["TODO", "DOING", "DONE"];

interface TaskCardProps {
  task: Task;
  onOpen: (id: string) => void;
  boardId: string;
  canEdit?: boolean;
  members?: BoardMember[];
}

function initials(nameOrEmail: string) {
  const s = (nameOrEmail || "").trim();
  if (!s) return "?";
  const parts = s.split(/\s+/).filter(Boolean);
  const two = parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
  return (two || s.charAt(0).toUpperCase()).slice(0, 2);
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onOpen,
  boardId,
  canEdit = true,
  members = [],
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
    if (!canEdit) return;

    const targetIndex = direction === "forward" ? statusIndex + 1 : statusIndex - 1;
    if (targetIndex < 0 || targetIndex >= statusOrder.length) return;

    const targetStatus = statusOrder[targetIndex];
    setError(null);

    try {
      await update.mutateAsync({
        taskId: task.id,
        body: { status: targetStatus, order: getNextOrder(targetStatus) },
      });
      dispatch(showToast({ message: `Moved to ${targetStatus}`, variant: "info" }));
    } catch (err) {
      const apiError = err as Error;
      setError(apiError.message);
    }
  };

  // ---------- Assignee (better UI) ----------
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const assigneeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!assigneeRef.current) return;
      if (!assigneeRef.current.contains(e.target as Node)) setAssigneeOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAssigneeOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const assignedMember = useMemo(
    () => members.find((m) => m.user.id === task.assignedTo),
    [members, task.assignedTo]
  );

  const selectedLabel =
    assignedMember?.user.name || assignedMember?.user.email || "Assign";

  const options = useMemo(() => {
    const list = members
      .map((m) => ({
        userId: m.user.id,
        label: m.user.name || m.user.email || "",
        email: m.user.email || "",
      }))
      .filter((m) => m.userId && m.label);

    const q = assigneeQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter((m) => {
      const hay = `${m.label} ${m.email}`.toLowerCase();
      return hay.includes(q);
    });
  }, [members, assigneeQuery]);

  const setAssignee = async (userId: string | null) => {
    if (!canEdit) return;

    const targetMember = members.find((m) => m.user.id === userId);
    const label = targetMember ? targetMember.user.name || targetMember.user.email : "Unassigned";

    setError(null);
    try {
      await update.mutateAsync({
        taskId: task.id,
        body: { assignedTo: userId },
      });

      dispatch(
        showToast({
          message: userId ? `Assigned to ${label}` : "Unassigned",
          variant: userId ? "info" : "success",
        })
      );

      setAssigneeOpen(false);
      setAssigneeQuery("");
    } catch (err) {
      const apiError = err as Error;
      setError(apiError.message);
    }
  };

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const priorityVariant =
    task.priority === "HIGH" ? "danger" : task.priority === "MEDIUM" ? "warning" : "primary";

  return (
    <div
      className="group relative flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg transition hover:border-sky-500/30 hover:bg-slate-900/80 cursor-pointer"
      onClick={() => onOpen(task.id)}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={priorityVariant}>{task.priority}</Badge>

          {/* Compact assignee chip */}
          <div ref={assigneeRef} className="relative" onClick={stop}>
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => {
                if (!canEdit) return;
                setAssigneeOpen((v) => !v);
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 transition
                ${
                  canEdit
                    ? "border-slate-700/60 bg-slate-950/35 text-slate-200 hover:bg-slate-950/55 hover:border-slate-500"
                    : "border-slate-800 bg-slate-950/20 text-slate-500 cursor-not-allowed"
                }`}
              aria-haspopup="menu"
              aria-expanded={assigneeOpen}
              title={assignedMember ? selectedLabel : "Assign task"}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold
                  ${
                    assignedMember
                      ? "border-white/10 bg-white/5 text-white"
                      : "border-sky-500/20 bg-sky-500/10 text-sky-200"
                  }`}
              >
                {assignedMember ? initials(selectedLabel) : <UserPlus2 size={14} />}
              </span>

              {/* Keep label short so it doesn't dominate the card */}
              <span className="max-w-[90px] truncate text-xs font-semibold">
                {assignedMember ? selectedLabel : "Assign"}
              </span>

              {canEdit && <ChevronDown size={14} className="text-slate-400" />}
            </button>

            {assigneeOpen && canEdit && (
              <div
                role="menu"
                className="absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur"
                onClick={stop}
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
                    Assignee
                  </div>

                  <button
                    type="button"
                    onClick={() => setAssignee(null)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-300 hover:border-slate-500 hover:text-white"
                    title="Unassign"
                  >
                    <X size={12} />
                    Clear
                  </button>
                </div>

                <div className="px-3 pb-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-700/60 bg-black/20 px-3 py-2">
                    <Search size={14} className="text-slate-400" />
                    <input
                      value={assigneeQuery}
                      onChange={(e) => setAssigneeQuery(e.target.value)}
                      placeholder="Search member…"
                      className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-auto pb-2">
                  {/* Unassigned option */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setAssignee(null)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/60 bg-black/20 text-slate-200">
                      <X size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">Unassigned</div>
                      <div className="text-xs text-slate-400">No one owns this task</div>
                    </div>
                    {!task.assignedTo && <Check size={16} className="text-sky-300" />}
                  </button>

                  <div className="my-2 h-px bg-white/5" />

                  {options.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-slate-400">
                      No members match “{assigneeQuery}”.
                    </div>
                  ) : (
                    options.map((m) => {
                      const selected = task.assignedTo === m.userId;
                      return (
                        <button
                          key={m.userId}
                          type="button"
                          role="menuitem"
                          onClick={() => setAssignee(m.userId)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-bold text-white">
                            {initials(m.label)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{m.label}</div>
                            {m.email && <div className="truncate text-xs text-slate-400">{m.email}</div>}
                          </div>
                          {selected && <Check size={16} className="text-sky-300" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hover actions */}
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMove("backward");
              }}
              disabled={!canMoveBackward || update.isPending}
              className="rounded-full border border-slate-700/60 bg-black/30 p-1 text-slate-400 hover:border-slate-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMove("forward");
              }}
              disabled={!canMoveForward || update.isPending}
              className="rounded-full border border-slate-700/60 bg-black/30 p-1 text-slate-400 hover:border-slate-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(task.id);
              }}
              className="rounded-full border border-slate-700/60 bg-black/30 p-1 text-slate-400 hover:border-slate-500 hover:text-white"
            >
              <Edit2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Title + desc */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white">{task.title}</h3>
        <p className="text-xs leading-relaxed text-slate-400 line-clamp-2">
          {task.description || "No description yet."}
        </p>
      </div>

      {/* Labels */}
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

      {/* Footer */}
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
