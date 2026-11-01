import { ArrowRight, Trophy, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/format";

const StrategyCard = ({ title, subtitle, winner, amount, score, color = "cyan", icon = Trophy }) => {
  const colorMap = {
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    purple: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-navy-800 border rounded-2xl p-6 shadow-card ${colorMap[color]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded bg-navy-900 border border-navy-600">
          {subtitle}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Winning Bidder</p>
          <p className="text-xl font-bold text-slate-100">{winner}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Winning Amount</p>
          <p className="text-2xl font-bold text-cyan-400">{formatCurrency(amount)}</p>
        </div>
        {score !== undefined && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Utility Score</p>
            <p className="text-xl font-bold text-purple-400">{score.toFixed(2)}</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-navy-700/50 flex items-center gap-2">
        <ArrowRight className="w-4 h-4 text-cyan-400" />
        <span className="text-sm text-slate-400">View detailed breakdown</span>
      </div>
    </motion.div>
  );
};

import { cn } from "../ui/utils";

StrategyCard.displayName = "StrategyCard";
export default StrategyCard;