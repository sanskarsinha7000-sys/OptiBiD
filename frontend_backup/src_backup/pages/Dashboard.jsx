import { useEffect } from "react";
import { useAuction } from "../context/AuctionContext";
import PageHeader from "../components/layout/PageHeader";
import AuctionSummary from "../components/auction/AuctionSummary";
import BidTable from "../components/auction/BidTable";
import EmptyState from "../components/ui/EmptyState";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { formatCurrency, formatNumber } from "../utils/format";
import { PlusCircle, Gavel, List, BarChart3, Trophy, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { auction, bids, loading, error } = useAuction();

  useEffect(() => {
    // Data is loaded via context
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-navy-700 border-t-cyan-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const bidCount = bids ? bids.length : 0;
  const highestBid = bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : 0;

  const quickActions = [
    {
      title: "Create Auction",
      desc: "Start a new auction for your product",
      icon: PlusCircle,
      href: "/app/create-auction",
      color: "cyan",
    },
    {
      title: "Place Bid",
      desc: "Submit a bid on the current auction",
      icon: Gavel,
      href: "/app/place-bid",
      color: "purple",
    },
    {
      title: "View Bids",
      desc: "Review all placed bids",
      icon: List,
      href: "/app/bid-history",
      color: "slate",
    },
    {
      title: "Compare Strategies",
      desc: "Run highest-price and utility strategies",
      icon: BarChart3,
      href: "/app/strategy-analysis",
      color: "emerald",
    },
  ];

  if (!auction) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Dashboard" description="Manage your auctions and bids" />
        <EmptyState
          icon={<Clock className="w-10 h-10 text-slate-500" />}
          title="No Active Auction"
          description="You haven't created an auction yet. Get started by creating one."
          actionLabel="Create Your First Auction"
          action={() => {}}
        />
        <div className="mt-8 flex gap-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="p-6 hover:border-cyan-500/50 transition-colors group cursor-pointer" onClick={() => {}}>
              <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center mb-3 group-hover:bg-cyan-500 group-hover:text-navy-900 transition-colors">
                <action.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">{action.title}</h3>
              <p className="text-sm text-slate-400">{action.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        description="Overview of your current auction and recent activity"
        breadcrumb={[
          { label: "Dashboard", link: null },
        ]}
      />

      <AuctionSummary auction={auction} bidCount={bidCount} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Recent Bid Activity</h3>
                <p className="text-sm text-slate-400">
                  {bidCount} bid{bidCount !== 1 ? "s" : ""} placed so far
                </p>
              </div>
              {auction.active && (
                <Link to="/app/place-bid">
                  <Button size="sm">Place a Bid</Button>
                </Link>
              )}
            </div>
            <BidTable bids={bids} />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  to={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-navy-700 hover:bg-navy-700/50 hover:border-cyan-500/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-100">{action.title}</h4>
                    <p className="text-xs text-slate-500">{action.desc}</p>
                  </div>
                  <svg
                    className="w-4 h-4 text-slate-600 group-hover:text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </Card>

          {auction.active && (
            <Card className="p-6 border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 mb-1">Auction is Active</h3>
                  <p className="text-xs text-amber-300">
                    Bids are being accepted. Close the auction when ready to run strategies.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {!auction.active && bids.length > 0 && (
            <Card className="p-6 border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 mb-1">Ready for Strategy Comparison</h3>
                  <p className="text-xs text-emerald-300">
                    The auction is closed. Run strategies to determine the winner.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {error && (
        <Card variant="danger" className="mt-6 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </Card>
      )}
    </div>
  );
}
  }