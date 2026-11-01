import { formatCurrency, formatNumber } from "../../utils/format";
import { Gavel, List, Clock, TrendingUp } from "lucide-react";

const AuctionSummary = ({ auction, bidCount }) => {
  const statusColor = auction.active ? "text-emerald-400" : "text-amber-400";
  const statusBg = auction.active ? "bg-emerald-500/10" : "bg-amber-500/10";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Product</p>
            <h3 className="text-lg font-bold text-slate-100">{auction?.productName || "—"}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center text-cyan-400">
            <Gavel className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-2">{auction?.description || "No description"}</p>
      </div>

      <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
            <span className={`flex items-center gap-1.5 mt-1 ${statusColor} ${statusBg} px-2 py-1 rounded text-xs font-medium border border-navy-600`}>
              {auction?.active ? "Active" : "Closed"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-2">
          Starting: {formatCurrency(auction?.startingPrice || 0)}
        </p>
      </div>

      <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Bids</p>
            <h3 className="text-2xl font-bold text-slate-100">{formatNumber(bidCount)}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        {auction?.active && (
          <p className="text-sm text-slate-400 mt-2">Highest: {formatCurrency(auction?.startingPrice || 0)}</p>
        )}
        {!auction?.active && (
          <p className="text-sm text-slate-400 mt-2">Auction closed</p>
        )}
      </div>
    </div>
  );
};

AuctionSummary.displayName = "AuctionSummary";
export default AuctionSummary;