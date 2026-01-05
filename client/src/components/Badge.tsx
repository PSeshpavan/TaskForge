import React from "react";

type Variant = "neutral" | "primary" | "warning" | "danger" | "outline";

export const Badge: React.FC<{ children: React.ReactNode; variant?: Variant; className?: string }> = ({
  children,
  variant = "neutral",
  className = "",
}) => {
  const base = "inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.3em]";
  const variants: Record<Variant, string> = {
    neutral: "bg-white/5 text-slate-200 border border-slate-700",
    primary: "bg-sky-500/10 text-sky-300 border border-sky-400",
    warning: "bg-amber-500/10 text-amber-300 border border-amber-400",
    danger: "bg-rose-500/10 text-rose-300 border border-rose-400",
    outline: "bg-transparent text-slate-300 border border-slate-600",
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
};
