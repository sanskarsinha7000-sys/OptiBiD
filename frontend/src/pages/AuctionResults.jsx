import { useEffect } from "react";
import { useAuction } from "../context/AuctionContext";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import ScoreBar from "../components/auction/ScoreBar";
import { formatCurrency } from "../utils/format";
import { Trophy, Crown, List, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuctionResults() {
  const { auction, bids, priceResult, utilityResult, loading, error, loadResults } = useAuction();

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-navy-700 border-t-cyan-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Auction Results" description="View final auction results" />
        <div className="text-center py-20">
          <Badge variant="warning">No Auction</Badge>
          <h2 className="text-xl font-bold text-slate-100 mt-4">No Results Available</h2>
          <p className="text-slate-400">Create an auction first to view results.</p>
        </div>
      </div>
    );
  }

  const hasResults = priceResult?.calculated || utilityResult?.calculated;

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Auction Results"
        description={`Final results for "${auction.productName}"`}
        breadcrumb={[
          { label: "Dashboard", link: "/app/dashboard" },
          { label: "Auction Results", link: null },
        ]}
      />

      <Card className="mb-6 p-6 border border-navy-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{auction.productName}</h3>
            <p className="text-sm text-slate-400">{auction.description || "No description"}</p>
          </div>
          <Badge variant={auction.active ? "active" : "closed"}>
            {auction.active ? "Active" : "Closed"}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-navy-700">
          <div className="p-4 bg-navy-800 rounded-lg border border-navy-700 text-center">
            <p className="text-xs text-slate-500 uppercase">Starting Price</p>
            <p className="text-lg font-bold text-slate-100">{formatCurrency(auction.startingPrice)}</p>
          </div>
          <div className="p-4 bg-navy-800 rounded-lg border border-navy-700 text-center">
            <p className="text-xs text-slate-500 uppercase">Total Bids</p>
            <p className="text-lg font-bold text-slate-100">{bids.length}</p>
          </div>
          <div className="p-4 bg-navy-800 rounded-lg border border-navy-700 text-center">
            <p className="text-xs text-slate-500 uppercase">Status</p>
            <p className="text-lg font-bold text-slate-100">
              {auction.active ? "Active" : "Closed"}
            </p>
          </div>
        </div>
      </Card>

      {!hasResults && (
        <div className="text-center py-20">
          <Badge variant="warning">Not Calculated</Badge>
          <h2 className="text-xl font-bold text-slate-100 mt-4">Results Not Yet Calculated</h2>
          <p className="text-slate-400">Run strategies to determine the winners.</p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link to="/app/strategy-analysis">
              <Button>Run Strategies</Button>
            </Link>
          </div>
        </div>
      )}

      {hasResults && (
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 border-cyan-500/30 bg-cyan-500/5">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-slate-100">Highest-Price Winner</h3>
            </div>
            {priceResult?.hasWinner ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-300">Winner</p>
                <p className="text-2xl font-bold text-slate-100">{priceResult.winnerName}</p>
                <p className="text-sm font-medium text-slate-300">Winning Bid</p>
                <p className="text-2xl font-bold text-cyan-400">{formatCurrency(priceResult.amount)}</p>
                <p className="text-xs text-slate-500">Serial #{priceResult.serial}</p>
              </div>
            ) : (
              <p className="text-slate-400">No winner determined.</p>
            )}
          </Card>

          <Card className="p-6 border-purple-500/30 bg-purple-500/5">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-slate-100">Utility-Based Winner</h3>
            </div>
            {utilityResult?.hasWinner ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-300">Winner</p>
                <p className="text-2xl font-bold text-slate-100">{utilityResult.winnerName}</p>
                <p className="text-sm font-medium text-slate-300">Winning Bid</p>
                <p className="text-2xl font-bold text-cyan-400">{formatCurrency(utilityResult.amount)}</p>
                <p className="text-sm font-medium text-slate-300">Utility Score</p>
                <p className="text-2xl font-bold text-purple-400">{utilityResult.utilityScore?.toFixed(2) || "—"}</p>
                <p className="text-xs text-slate-500">Serial #{utilityResult.serial}</p>
              </div>
            ) : (
              <p className="text-slate-400">No winner determined.</p>
            )}
          </Card>
        </div>
      )}

      {bids.length > 0 && hasResults && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-100">Per-Bid Scoring Breakdown</h3>
            <Badge variant="info">Price: 70% | Time: 30%</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-navy-700 bg-navy-700/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Serial</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Bidder</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Price Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Time Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Utility Score</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid) => (
                  <tr key={bid.serial} className="border-b border-navy-700/50 hover:bg-navy-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-slate-300">#{bid.serial}</td>
                    <td className="px-6 py-4 text-sm text-slate-200">{bid.bidderName}</td>
                    <td className="px-6 py-4 text-sm text-cyan-400">{formatCurrency(bid.amount)}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{bid.priceScore?.toFixed(2) || "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{bid.timeScore?.toFixed(2) || "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{bid.utilityScore?.toFixed(2) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
