import { cn } from "./utils";

const Badge = ({ className, variant = "default", children }) => {
  const variants = {
    default: "bg-navy-700 text-slate-100",
    cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    danger: "bg-red-500/10 text-red-400 border border-red-500/30",
    active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    closed: "bg-slate-500/10 text-slate-400 border border-slate-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

Badge.displayName = "Badge";
export default Badge;