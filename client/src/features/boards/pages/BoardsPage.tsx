import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMeQuery } from "../../../features/auth/hooks/useMeQuery";
import { useBoardsQuery } from "../hooks/useBoardsQuery";
import { useCreateBoard } from "../hooks/useCreateBoard";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Card } from "../../../components/Card";
import { EmptyState } from "../../../components/EmptyState";
import type { BoardSummary } from "../types";

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export const BoardsPage: React.FC = () => {
  const boardsQ = useBoardsQuery();
  const createBoard = useCreateBoard();
  const [name, setName] = useState("");
  const { data: meData } = useMeQuery();

  const boards = useMemo(() => boardsQ.data?.boards ?? [], [boardsQ.data]);
  const loading = boardsQ.isLoading;

  const onCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await createBoard.mutateAsync({ name: trimmed });
    setName("");
  };

  const currentUserId = meData?.user?.id;
  const renderOwnerLabel = (board: BoardSummary) => {
    if (currentUserId && board.ownerId === currentUserId) return "Owner you";
    if (board.owner?.name || board.owner?.email) {
      const ownerLabel = board.owner.name || board.owner.email;
      return `Owner ${ownerLabel}`;
    }
    return "Shared with you";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-120px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute left-10 top-[180px] h-[420px] w-[640px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-10 top-[360px] h-[420px] w-[640px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <Card className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Workspace</p>
            <h1 className="text-3xl font-semibold text-white">Boards</h1>
            <p className="text-sm text-slate-400">
              Keep projects organized with kanban-style boards.
            </p>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Create board</p>
              <h2 className="text-xl font-semibold text-white">Start a new space</h2>
            </div>
            <p className="text-sm text-slate-400">
              Boards group tasks by status, helping teams move work forward.
            </p>
            <form onSubmit={onCreate} className="space-y-4">
              <Input
                label="Board name"
                value={name}
                onChange={setName}
                placeholder="E.g., Product roadmap"
              />
              {createBoard.error && (
                <p className="text-xs text-rose-400">
                  {(createBoard.error as any)?.data?.message || (createBoard.error as any)?.message || "Unable to create board"}
                </p>
              )}
              <Button type="submit" variant="primary" disabled={createBoard.isPending || !name.trim()} className="w-full">
                {createBoard.isPending ? "Creating..." : "Create board"}
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your boards</p>
                <h2 className="text-xl font-semibold text-white">Jump back in</h2>
              </div>
              <p className="text-sm text-slate-400">{boards.length} boards</p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-32 w-full animate-pulse rounded-2xl bg-slate-900/60" />
                ))}
              </div>
            ) : boards.length === 0 ? (
              <EmptyState
                title="No boards yet"
                description="Create your first board to manage tasks."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {boards.map((board) => (
                  <Link key={board.id} to={`/boards/${board.id}`}>
                    <div className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-sky-500/40 hover:bg-slate-900/80">
                      <div>
                        <p className="text-base font-semibold text-white">{board.name}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                          Created {formatDate(board.createdAt)}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400">{renderOwnerLabel(board)}</span>
                        <Button variant="ghost" size="sm">
                          Open
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};
