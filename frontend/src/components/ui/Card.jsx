import { cn } from "./utils";

const Card = ({ className, children, variant = "default", padding = "p-6" }) => {
  const variants = {
    default: "bg-navy-800 border border-navy-700 rounded-xl shadow-card",
    elevated: "bg-navy-800 border border-navy-600 rounded-xl shadow-glow",
    glass: "glass-panel rounded-xl",
  };

  return (
    <div className={cn(variants[variant], padding, className)}>
      {children}
    </div>
  );
};

Card.displayName = "Card";
export default Card;