import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

import { useBoardQuery } from "../hooks/useBoardQuery";
import { useTasksQuery } from "../../tasks/hooks/useTasksQuery";
import { useActivityQuery } from "../../activity/hooks/useActivityQuery";
import { useAddMember } from "../hooks/useAddMember";
import { useReorderTasks } from "../../tasks/hooks/useReorderTasks";
import { useDispatch, useSelector } from "react-redux";
import {
  openTaskModal,
  setStatusFilter,
  setPriorityFilter,
  setDueFilter,
  setSearchText,
  showToast,
} from "../../../ui/uiSlice";
import type { RootState } from "../../../app/store/store";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { ActivityList } from "../../activity/components/ActivityList";
import { TaskCard } from "../../tasks/components/TaskCard";
import { TaskModal } from "../../tasks/components/TaskModal";
import { EmptyState } from "../../../components/EmptyState";
import { Spinner } from "../../../components/Spinner";
import { Modal } from "../../../components/Modal";
import { Badge } from "../../../components/Badge";
import type { ApiError } from "../../../lib/apiClient";

import type { Task } from "../../tasks/types";

const statuses = [
  { id: "TODO", label: "To do", color: "bg-amber-500" },
  { id: "DOING", label: "Doing", color: "bg-sky-500" },
  { id: "DONE", label: "Done", color: "bg-emerald-500" },
] as const;

type Status = (typeof statuses)[number]["id"];

const initialSkeleton = Array.from({ length: 3 });

export const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const dispatch = useDispatch();
  const { status, priority, due, searchText } = useSelector((state: RootState) => state.ui);

  const boardQ = useBoardQuery(boardId ?? "");
  const tasksQ = useTasksQuery(boardId ?? "");
  const actQ = useActivityQuery(boardId ?? "");

  const addMember = useAddMember(boardId ?? "");
  const reorderMut = useReorderTasks(boardId ?? "");

  const [dndTasks, setDndTasks] = useState<Task[]>([]);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const boardData = boardQ.data;
  const board = boardData?.board;
  const members = boardData?.members ?? [];
  const activities = actQ.data?.activities ?? [];

  useEffect(() => {
    if (tasksQ.data?.tasks) {
      setDndTasks(tasksQ.data.tasks);
    }
  }, [tasksQ.data?.tasks]);

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredTasks = useMemo(() => {
    let items = dndTasks;
    if (status !== "ALL") {
      items = items.filter((task) => task.status === status);
    }
    if (priority !== "ALL") {
      items = items.filter((task) => task.priority === priority);
    }
    const now = new Date();
    if (due === "OVERDUE") {
      items = items.filter((task) => task.dueDate && new Date(task.dueDate) < now);
    }
    if (due === "UPCOMING") {
      items = items.filter((task) => task.dueDate && new Date(task.dueDate) >= now);
    }
    if (normalizedSearch) {
      items = items.filter((task) => {
        const haystack = [task.title, task.description].join(" ").toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }
    return items;
  }, [dndTasks, status, priority, due, normalizedSearch]);

  const columns = useMemo(() => {
    const map: Record<Status, Task[]> = { TODO: [], DOING: [], DONE: [] };
    filteredTasks.forEach((task) => {
      map[task.status as Status].push(task);
    });
    map.TODO.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    map.DOING.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    map.DONE.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return map;
  }, [filteredTasks]);

  // const handleDragEnd = async (result: DropResult) => {
  //   const { source, destination, draggableId } = result;
  //   if (!destination || !boardId) return;
  //   const fromStatus = source.droppableId as Status;
  //   const toStatus = destination.droppableId as Status;
  //   if (fromStatus === toStatus && destination.index === source.index) return;

  //   const previousTasks = dndTasks;
  //   const remaining = previousTasks.filter((task) => task.id !== draggableId);
  //   const targetList = remaining.filter((task) => task.status === toStatus);
  //   const insertIndex = Math.min(destination.index, targetList.length);
  //   const movedTask = previousTasks.find((task) => task.id === draggableId);
  //   if (!movedTask) return;
  //   const updatedMoved = { ...movedTask, status: toStatus };
  //   targetList.splice(insertIndex, 0, updatedMoved);

  //   const reconstructed: Task[] = [];
  //   (["TODO", "DOING", "DONE"] as Status[]).forEach((statusKey) => {
  //     if (statusKey === toStatus) {
  //       reconstructed.push(...targetList);
  //       return;
  //     }
  //     reconstructed.push(...remaining.filter((task) => task.status === statusKey));
  //   });

  //   setDndTasks(reconstructed);
  //   setReorderError(null);

  //   const buildUpdates = (statusFilter: Status) =>
  //     nextTasks
  //       .filter((task) => task.status === statusFilter)
  //       .map((task, idx) => ({
  //         taskId: task.id,
  //         status: statusFilter,
  //         order: (idx + 1) * 1000,
  //       }));

  //   const statusesToUpdate = new Set<Status>();
  //   statusesToUpdate.add(fromStatus);
  //   statusesToUpdate.add(toStatus);
  //   const updates = Array.from(statusesToUpdate).flatMap((statusId) => buildUpdates(statusId));

  //   try {
  //     await reorderMut.mutateAsync({ updates });
  //   } catch (err) {
  //     const apiError = err as ApiError;
  //     setReorderError(apiError?.data?.message || apiError.message || "Unable to reorder tasks");
  //   setDndTasks(previousTasks);
  //   }
  // };



  const handleDragEnd = async (result: DropResult) => {
  const { source, destination, draggableId } = result;
  if (!destination || !boardId) return;

  const fromStatus = source.droppableId as Status;
  const toStatus = destination.droppableId as Status;

  if (fromStatus === toStatus && destination.index === source.index) return;

  const previousTasks = [...dndTasks];

  // Build columns from ALL tasks (not filteredTasks)
  const cols: Record<Status, Task[]> = { TODO: [], DOING: [], DONE: [] };
  previousTasks.forEach((t) => cols[t.status as Status].push(t));

  // Always sort by order before doing index-based moves
  (["TODO", "DOING", "DONE"] as Status[]).forEach((k) => {
    cols[k].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  const fromList = [...cols[fromStatus]];
  const toList = fromStatus === toStatus ? fromList : [...cols[toStatus]];

  const fromIndex = source.index;
  const [moved] = fromList.splice(fromIndex, 1);
  if (!moved) return;

  const insertIndex = Math.min(destination.index, toList.length);
  const movedUpdated: Task = { ...moved, status: toStatus };
  toList.splice(insertIndex, 0, movedUpdated);

  // Rebuild next tasks (optimistic UI)
  const nextCols: Record<Status, Task[]> = {
    TODO: fromStatus === "TODO" ? fromList : toStatus === "TODO" ? toList : cols.TODO,
    DOING: fromStatus === "DOING" ? fromList : toStatus === "DOING" ? toList : cols.DOING,
    DONE: fromStatus === "DONE" ? fromList : toStatus === "DONE" ? toList : cols.DONE,
  };

  const nextTasks: Task[] = [];
  (["TODO", "DOING", "DONE"] as Status[]).forEach((k) => {
    nextCols[k].forEach((t, idx) => {
      nextTasks.push({
        ...t,
        status: k,
        order: (idx + 1) * 1000,
      });
    });
  });

  setDndTasks(nextTasks);
  setReorderError(null);

  // Build payload expected by useReorderTasks (updates[])
  const updates = (["TODO", "DOING", "DONE"] as Status[])
    .filter((k) => k === fromStatus || k === toStatus)
    .flatMap((k) =>
      nextCols[k].map((t, idx) => ({
        taskId: t.id ?? (t as any)._id, // safe fallback
        status: k,
        order: (idx + 1) * 1000,
      }))
    );

  try {
    await reorderMut.mutateAsync({ updates });
  } catch (err) {
    const apiError = err as ApiError;
    setReorderError(apiError?.data?.message || apiError.message || "Unable to reorder tasks");
    setDndTasks(previousTasks);
  }
};



  const handleInvite = async () => {
    if (!inviteEmail.trim() || !boardId) return;
    setInviteError(null);
    try {
      await addMember.mutateAsync({ email: inviteEmail.trim() });
      dispatch(showToast({ message: "Member invited", variant: "success" }));
      setInviteEmail("");
      setInviteOpen(false);
    } catch (err) {
      const apiError = err as ApiError;
      setInviteError(apiError?.data?.message || apiError.message || "Unable to invite member");
    }
  };

  const owner = members.find((m) => m.role === "OWNER");
  const visibleMembers = members.slice(0, 5);

  if (boardQ.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={6} />
      </div>
    );
  }

  if (!board) {
    return <EmptyState title="Board not found" description="You don't have access to this board." />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/40 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Board</p>
            <h1 className="text-3xl font-semibold text-white">{board.name}</h1>
            {owner && (
              <p className="text-sm text-slate-400">
                Owned by <span className="text-slate-100">{owner.user.name}</span>
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex -space-x-2">
                {visibleMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs font-semibold uppercase text-white shadow-inner"
                  >
                    {member.user.name
                      .split(" ")
                      .map((part) => part.charAt(0))
                      .join("")
                      .slice(0, 2)}
                  </div>
                ))}
                {members.length > visibleMembers.length && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[11px] text-slate-300 shadow-inner">
                    +{members.length - visibleMembers.length}
                  </div>
                )}
              </div>
              <Badge variant="outline" className="uppercase tracking-[0.3em]">
                {members.length} members
              </Badge>
            </div>
            {reorderError && <p className="mt-2 text-xs text-rose-400">{reorderError}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/boards" className="text-sm text-slate-400 hover:text-white">
              ← Back to boards
            </Link>
            <Button variant="ghost" onClick={() => dispatch(openTaskModal())}>
              New task
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setInviteOpen(true);
                setInviteError(null);
              }}
            >
              Invite member
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/40">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Filters</p>
              <h2 className="text-lg font-semibold text-white">Refine your view</h2>
            </div>
            <p className="text-sm text-slate-400">
              Status, priority, due date, and search are reflected immediately.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              Status
              <select
                value={status}
                onChange={(event) => dispatch(setStatusFilter(event.target.value as any))}
                className="mt-2 w-full rounded-2xl border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <option value="ALL">All</option>
                <option value="TODO">To do</option>
                <option value="DOING">Doing</option>
                <option value="DONE">Done</option>
              </select>
            </label>
            <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              Priority
              <select
                value={priority}
                onChange={(event) => dispatch(setPriorityFilter(event.target.value as any))}
                className="mt-2 w-full rounded-2xl border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <option value="ALL">All</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>
            <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              Due
              <select
                value={due}
                onChange={(event) => dispatch(setDueFilter(event.target.value as any))}
                className="mt-2 w-full rounded-2xl border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <option value="ALL">All</option>
                <option value="OVERDUE">Overdue</option>
                <option value="UPCOMING">Upcoming</option>
              </select>
            </label>
            <Input
              label="Search"
              value={searchText}
              onChange={(value) => dispatch(setSearchText(value))}
              placeholder="Search title or description"
            />
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-6 lg:grid-cols-[repeat(3,_minmax(0,_1fr))_320px]">
          {statuses.map((column) => (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${column.color}`} />
                  <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                    {column.label}
                  </h3>
                </div>
                <span className="rounded-full border border-slate-700/60 bg-slate-900/40 px-3 py-0.5 text-[10px] text-slate-400">
                  {columns[column.id].length}
                </span>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[400px] rounded-3xl border border-slate-800/70 bg-slate-900/70 px-3 py-4 transition ${
                      snapshot.isDraggingOver ? "border-sky-500/50 bg-sky-500/10" : "border-slate-800/40 bg-slate-900/70"
                    }`}
                  >
                    {tasksQ.isLoading ? (
                      <div className="space-y-3">
                        {initialSkeleton.map((_, index) => (
                          <div
                            key={index}
                            className="h-20 w-full animate-pulse rounded-2xl bg-slate-800/40"
                          />
                        ))}
                      </div>
                    ) : columns[column.id].length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-700/30 p-6 text-center text-xs text-slate-400">
                        No tasks here. Drag or create one.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {columns[column.id].map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={dragSnapshot.isDragging ? "z-50" : ""}
                              >
                                <TaskCard
                                  task={task}
                                  boardId={boardId ?? ""}
                                  onOpen={(id) => dispatch(openTaskModal(id))}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/40">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Activity</p>
                <Badge variant="outline">{activities.length} entries</Badge>
              </div>
              <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <ActivityList activities={activities} />
              </div>
            </div>
          </aside>
        </div>
      </DragDropContext>

      <TaskModal boardId={boardId ?? ""} />

      <Modal
        open={isInviteOpen}
        onClose={() => {
          setInviteOpen(false);
          setInviteError(null);
          setInviteEmail("");
        }}
        title="Invite member"
      >
        <div className="space-y-4">
          <Input
            label="Email"
            value={inviteEmail}
            onChange={setInviteEmail}
            placeholder="coworker@example.com"
          />
          {inviteError && <p className="text-xs text-rose-400">{inviteError}</p>}
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleInvite}
              disabled={addMember.isPending}
            >
              {addMember.isPending ? "Inviting..." : "Send invite"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
