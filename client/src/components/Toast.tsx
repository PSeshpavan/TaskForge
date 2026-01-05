import React from "react";
import { X } from "lucide-react";

type Variant = "success" | "error" | "info";

const variantClasses: Record<Variant, string> = {
  success: "bg-emerald-600",
  error: "bg-rose-500",
  info: "bg-sky-500",
};

export const Toast: React.FC<{ message: string; variant: Variant; onClose: () => void }> = ({
  message,
  variant,
  onClose,
}) => {
  return (
    <div
      className={`pointer-events-auto fixed bottom-6 right-6 z-50 flex max-w-xs items-center justify-between gap-3 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-2xl ${variantClasses[variant]}`}
    >
      <span className="truncate">{message}</span>
      <button onClick={onClose} className="flex-shrink-0 text-white/90 hover:text-white focus:outline-none">
        <X size={16} />
      </button>
    </div>
  );
};
