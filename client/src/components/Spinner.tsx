import React from "react";

export const Spinner: React.FC<{ size?: number }> = ({ size = 8 }) => {
  const dimension = `${size}rem`;
  return (
    <div
      className="animate-spin rounded-full border-4 border-slate-700 border-t-sky-400"
      style={{ width: dimension, height: dimension }}
      aria-label="Loading"
    />
  );
};
