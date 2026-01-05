import React from "react";
import { X } from "lucide-react";

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ open, onClose, title, children, className = "" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4 py-10">
      <div className="absolute inset-0 cursor-pointer" aria-hidden onClick={onClose} />
      <div
        className={`relative z-10 w-full max-w-xl rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-2xl shadow-black/40 backdrop-blur ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/20 p-1 text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>
        {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
        <div className="mt-6 space-y-4">{children}</div>
      </div>
    </div>
  );
};
