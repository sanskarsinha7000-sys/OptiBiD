import { motion } from "framer-motion";

const ScoreBar = ({ label, score, color = "cyan", max = 100 }) => {
  const colorMap = {
    cyan: "bg-cyan-500 shadow-glow",
    purple: "bg-purple-500 shadow-glow-purple",
    emerald: "bg-emerald-500",
  };

  const width = Math.min((score / max) * 100, 100);

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-mono text-cyan-400">{score.toFixed(2)}</span>
      </div>
      <div className="w-full bg-navy-700 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(colorMap[color], "h-2.5 rounded-full transition-all duration-700")}
        />
      </div>
    </div>
  );
};

import { cn } from "../ui/utils";

ScoreBar.displayName = "ScoreBar";
export default ScoreBar;