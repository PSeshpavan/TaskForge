import React, { useEffect, useState } from "react";
import { Modal } from "../../../components/Modal";
import { useDispatch, useSelector } from "react-redux";
import { closeTaskModal, showToast } from "../../../ui/uiSlice";
import type { RootState } from "../../../app/store/store";
import { useCreateTask } from "../hooks/useCreateTask";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { useDeleteTask } from "../hooks/useDeleteTask";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { useQueryClient } from "@tanstack/react-query";
import type { Task } from "../types";
import { ApiError } from "../../../lib/apiClient";
import { ConfirmModal } from "../../../components/ConfirmModal";

const statusOptions: Task["status"][] = ["TODO", "DOING", "DONE"];
const priorityOptions: Task["priority"][] = ["LOW", "MEDIUM", "HIGH"];

export const TaskModal: React.FC<{ boardId: string }> = ({ boardId }) => {
  const { isTaskModalOpen, editingTaskId } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const create = useCreateTask(boardId);
  const update = useUpdateTask(boardId);
  const del = useDeleteTask(boardId);

  const tasks = queryClient.getQueryData<{ tasks: Task[] }>(["tasks", boardId])?.tasks ?? [];
  const editingTask = editingTaskId ? tasks.find((task) => task.id === editingTaskId) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("TODO");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [labelsInput, setLabelsInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("TODO");
    setPriority("MEDIUM");
    setDueDate("");
    setLabelsInput("");
    setError(null);
  };

  useEffect(() => {
    if (!isTaskModalOpen) {
      resetForm();
      setConfirmOpen(false);
      setConfirmError(null);
      return;
    }
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description ?? "");
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate ? editingTask.dueDate.split("T")[0] : "");
      setLabelsInput((editingTask.labels ?? []).join(", "));
    } else {
      resetForm();
    }
  }, [editingTask, isTaskModalOpen]);

  const parseLabels = () =>
    labelsInput
      .split(",")
      .map((label) => label.trim())
      .filter((label) => label.length > 0);

  const getErrorMessage = (err: unknown) => {
    const apiError = err as ApiError;
    return apiError?.data?.message || (apiError instanceof Error ? apiError.message : "Something went wrong");
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const body = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || null,
      labels: parseLabels(),
    };
    try {
      if (editingTaskId) {
        await update.mutateAsync({ taskId: editingTaskId, body });
        dispatch(showToast({ message: "Task updated", variant: "success" }));
      } else {
        await create.mutateAsync(body);
        dispatch(showToast({ message: "Task created", variant: "success" }));
      }
      dispatch(closeTaskModal());
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!editingTaskId) return;
    setConfirmError(null);
    try {
      await del.mutateAsync(editingTaskId);
      dispatch(showToast({ message: "Task deleted", variant: "info" }));
      dispatch(closeTaskModal());
      setConfirmOpen(false);
    } catch (err) {
      setConfirmError(getErrorMessage(err));
    }
  };

  const titleText = editingTaskId ? "Edit task" : "New task";
  const saving = create.isPending || update.isPending;

  return (
    <>
      <Modal open={isTaskModalOpen} onClose={() => dispatch(closeTaskModal())} title={titleText} className="max-w-lg">
        <form onSubmit={handleSave} className="space-y-5">
          <Input label="Title" value={title} onChange={setTitle} placeholder="Design polished UI" />
          <Input
            label="Description"
            value={description}
            onChange={setDescription}
            multiline
            rows={4}
            placeholder="Add context, links, or requirements"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as Task["status"])}
                className="w-full rounded-2xl border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Priority</span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as Task["priority"])}
                className="w-full rounded-2xl border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Due date" type="date" value={dueDate} onChange={setDueDate} placeholder="Add a date" />
            <Input
              label="Labels"
              value={labelsInput}
              onChange={setLabelsInput}
              placeholder="enter comma separated tags"
            />
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : editingTaskId ? "Save changes" : "Create task"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => dispatch(closeTaskModal())} disabled={saving}>
              Cancel
            </Button>
            {editingTaskId && (
              <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)} disabled={del.isPending}>
                Delete
              </Button>
            )}
          </div>
        </form>
      </Modal>
      <ConfirmModal
        open={isConfirmOpen}
        title="Confirm delete"
        description="This will permanently remove the task."
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        danger
        isLoading={del.isPending}
        errorText={confirmError ?? undefined}
      />
    </>
  );
};
