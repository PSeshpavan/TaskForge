import React from "react";

type ActivityLike = {
  id?: string;
  _id?: string;
  type?: string;
  action?: string;
  message?: string;
  title?: string;
  createdAt?: string;
  timestamp?: string;
};

function formatWhen(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  // Example: 05 Jan, 13:18
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function humanType(type?: string) {
  if (!type) return "ACTIVITY";
  return type.replaceAll("-", "_").toUpperCase();
}

function typeStyle(type?: string) {
  const t = humanType(type);

  // Color accents per event type (pure UI)
  if (t.includes("CREATED")) {
    return {
      dot: "bg-emerald-400",
      pill: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    };
  }
  if (t.includes("DELETED")) {
    return {
      dot: "bg-rose-400",
      pill: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    };
  }
  if (t.includes("MOVED") || t.includes("STATUS")) {
    return {
      dot: "bg-sky-400",
      pill: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    };
  }
  if (t.includes("UPDATED") || t.includes("EDITED")) {
    return {
      dot: "bg-amber-400",
      pill: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    };
  }

  return {
    dot: "bg-slate-400",
    pill: "border-white/10 bg-white/[0.03] text-slate-300",
  };
}

export const ActivityList: React.FC<{ activities?: ActivityLike[] }> = ({ activities }) => {
  const items = activities ?? [];

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700/30 bg-slate-950/20 p-6 text-center text-xs text-slate-400">
        No activity yet.
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {items.map((a) => {
        const key = a.id || a._id || `${a.type}-${a.createdAt}-${Math.random()}`;
        const type = a.type || a.action;
        const when = formatWhen(a.createdAt || a.timestamp);

        // Prefer message, fallback safely (UI-only)
        const headline = a.message || a.title || "Activity";
        const style = typeStyle(type);

        return (
          <li
            key={key}
            className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3 transition hover:bg-white/[0.04]"
          >
            {/* subtle left accent */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-[2px] bg-white/5" />

            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-100">
                      {headline}
                    </div>
                    {when && (
                      <div className="mt-0.5 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        {when}
                      </div>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.28em] ${style.pill}`}
                  >
                    {humanType(type)}
                  </span>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
