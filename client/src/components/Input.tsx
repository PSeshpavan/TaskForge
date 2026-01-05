import React from "react";

export const Input: React.FC<{
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
}> = ({ label, value, onChange, type = "text", placeholder, error, multiline = false, rows = 3 }) => {
  const base =
    "w-full rounded-2xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition focus:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";
  return (
    <label className="block text-sm space-y-2 text-slate-200">
      {label && <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</div>}
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${base} resize-none min-h-[120px]`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
      {error && <div className="text-xs text-rose-400">{error}</div>}
    </label>
  );
};
