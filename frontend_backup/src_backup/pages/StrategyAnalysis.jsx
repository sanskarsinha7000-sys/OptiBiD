import { useEffect, useState } from "react";
import { useAuction } from "../context/AuctionContext";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ScoreBar from "../components/auction/ScoreBar";
import StrategyCard from "../components/auction/StrategyCard";
import { showToast } from "../components/ui/Toast";
import { UTILITY_WEIGHTS } from "../utils/constants";
import { formatCurrency } from "../utils/format";
import { Trophy, Crown, BarChart3, Play, RefreshCw } from "lucide-react";

export default function StrategyAnalysis() {
  const {
    auction,
    bids,
    priceResult,
    utilityResult,
    loading,
    error,
    runPriceStrategy,
    runUtilityStrategy,
    compareStrategies,
    strategiesCalculated,
  } = useAuction();

  const [comparisonExplanation, setComparisonExplanation] = useState("");

  const scores = bids && bids.length > 0 ? bids.filter((b) => b.utilityScore !== undefined) : [];

  const handleRunPrice = async () => {
    const result = await runPriceStrategy();
    if (result.success) showToast("Highest-price strategy executed", "success");
    else showToast(result.error || "Failed", "error");
  };

  const handleRunUtility = async () => {
    const result = await runUtilityStrategy();
    if (result.success) showToast("Utility strategy executed", "success");
    else showToast(result.error || "Failed", "error");
  };

  const handleCompare = async () => {
    const result = await compareStrategies();
    if (result.success) {
      setComparisonExplanation(result.explanation || "");
      showToast("Both strategies compared", "success");
    } else {
      showToast(result.error || "Failed to compare", "error");
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-navy-700 border-t-cyan-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Loading strategies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div>
        <PageHeader title="Strategy Analysis" description="Compare winner selection strategies" />
        <div className="text-center py-20">
          <Badge variant="warning">No Auction</Badge>
          <h2 className="text-xl font-bold text-slate-100 mt-4">Create an auction first</h2>
          <p className="text-slate-400">You need to create an auction and place bids before running strategies.</p>
        </div>
      </div>
    );
  }

  if (auction.active) {
    return (
      <div>
        <PageHeader title="Strategy Analysis" description="Compare winner selection strategies" />
        <div className="text-center py-20">
          <Badge variant="warning">Auction Active</Badge>
          <h2 className="text-xl font-bold text-slate-100 mt-4">Close the auction first</h2>
          <p className="text-slate-400">Strategies can only be run after the auction is closed.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Strategy Analysis"
        description="Compare highest-price and utility-based greedy winner selection"
        breadcrumb={[{ label: "Dashboard", link: "/app/dashboard" }, { label: "Strategy Analysis", link: null }]}
      />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Strategy Controls</h2>
          <p className="text-slate-400">Run strategies on the closed auction to determine winners.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleRunPrice} disabled={!(auction && !auction.active && bids.length > 0)} size="sm">
            <Trophy className="w-4 h-4 mr-2" /> Highest-Price
          </Button>
          <Button onClick={handleRunUtility} disabled={!(auction && !auction.active && bids.length > 0)} size="sm">
            <Crown className="w-4 h-4 mr-2" /> Utility-Based
          </Button>
          <Button onClick={handleCompare} disabled={!(auction && !auction.active && bids.length > 0)} variant="primary" size="sm">
            <Play className="w-4 h-4 mr-2" /> Compare Both
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" /> Reset
          </Button>
        </div>
      </div>

      {bids.length === 0 && (
        <div>
          <Badge variant="warning">No Bids</Badge>
          <h2 className="text-xl font-bold text-slate-100 mt-4">No Bids Placed</h2>
          <p className="text-slate-400">Place some bids before running strategies.</p>
        </div>
      )}

      {bids.length > 0 && (
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-100">Per-Bid Score Breakdown</h3>
              <Badge variant="info">Price: {UTILITY_WEIGHTS.price * 100}% | Time: {UTILITY_WEIGHTS.time * 100}%</Badge>
            </div>
            <div className="space-y-4">
              {scores.map((bid) => {
                return (
                  <div key={bid.serial} className="p-4 bg-navy-800 rounded-xl border border-navy-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-mono text-slate-300">#{bid.serial}</span>
                      <span className="text-sm font-medium text-slate-100">{bid.bidderName}</span>
                      <span className="text-sm font-mono text-cyan-400">{formatCurrency(bid.amount)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <ScoreBar label="Price Score" score={bid.priceScore} color="cyan" />
                      <ScoreBar label="Time Score" score={bid.timeScore} color="purple" />
                      <ScoreBar label="Utility Score" score={bid.utilityScore} color="emerald" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {comparisonExplanation && (
        <Card className="p-6 border-cyan-500/30 bg-cyan-500/5">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-cyan-400 mt-1" />
            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">Strategy Comparison</h4>
              <p className="text-sm text-slate-300">{comparisonExplanation}</p>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div>
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
