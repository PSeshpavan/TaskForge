import type { Board } from "../types";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";

export default function BoardHeader({ board }: { board: Board }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
        <h1 className="mt-3 text-3xl font-semibold text-white">{board.name}</h1>
        <p className="text-sm text-slate-400">Organize tasks across TODO, DOING, and DONE</p>
      </div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
        <span className="rounded-full border border-slate-700 px-3 py-1">Actions</span>
        <Button size="sm" variant="ghost" onClick={() => navigate("/boards")}>
          All boards
        </Button>
      </div>
    </div>
  );
}
