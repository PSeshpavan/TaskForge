import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: ButtonSize;
};

function cx(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold " +
    "transition active:scale-[0.99] focus:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 " +
    "disabled:cursor-not-allowed disabled:opacity-50";

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const variants: Record<Variant, string> = {
    // ✅ Updated primary: clear accent, readable, looks like the “main” action
    primary:
      "text-slate-950 " +
      "bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 " +
      "shadow-lg shadow-sky-500/20 " +
      "hover:from-sky-300 hover:via-cyan-200 hover:to-sky-300 " +
      "border border-white/10",

    secondary:
      "text-slate-100 bg-white/5 hover:bg-white/10 border border-white/10",

    ghost:
      "text-slate-200 bg-transparent hover:bg-white/5 border border-white/10",

    danger:
      "text-white bg-rose-500/90 hover:bg-rose-500 border border-rose-400/30",
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={cx(base, sizeClasses[size], variants[variant], className)}
    />
  );
};
