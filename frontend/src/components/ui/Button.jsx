import { forwardRef } from "react";
import { cn } from "./utils";

const Button = forwardRef(({ className, variant = "primary", size = "md", disabled, loading, children, ...props }, ref) => {
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-navy-900 font-medium shadow-glow transition-all active:scale-95",
    secondary: "bg-navy-800 hover:bg-navy-700 text-slate-100 border border-navy-600 transition-all active:scale-95",
    outline: "bg-transparent hover:bg-navy-800 text-slate-100 border border-navy-600 transition-all active:scale-95",
    ghost: "hover:bg-navy-800 text-slate-400 transition-all active:scale-95",
    danger: "bg-red-600 hover:bg-red-500 text-white font-medium transition-all active:scale-95",
    success: "bg-emerald-500 hover:bg-emerald-400 text-navy-900 font-medium transition-all active:scale-95",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-navy-900"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;