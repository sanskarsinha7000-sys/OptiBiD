import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { cn } from "./utils";

const Logo = ({ className, to = "/", size = "md" }) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 font-bold tracking-tight",
        sizeClasses[size],
        className,
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-glow">
        <Zap className="w-5 h-5 text-navy-900" />
      </div>
      <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        OptiBiD
      </span>
    </Link>
  );
};

Logo.displayName = "Logo";
export default Logo;