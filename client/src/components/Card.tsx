import React from "react";

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => {
  return (
    <div
      className={`bg-slate-900/60 border border-slate-700/50 shadow-xl backdrop-blur rounded-2xl p-5 ${className}`}
    >
      {children}
    </div>
  );
};
