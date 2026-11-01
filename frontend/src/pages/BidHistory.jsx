import { useEffect } from "react";
import { useAuction } from "../context/AuctionContext";
import PageHeader from "../components/layout/PageHeader";
import BidTable from "../components/auction/BidTable";
import EmptyState from "../components/ui/EmptyState";
import Card from "../components/ui/Card";
import { formatCurrency } from "../utils/format";
import { Link } from "react-router-dom";
import { List, Clock } from "lucide-react";

export default function BidHistory() {
  const { auction, bids, loading, error } = useAuction();

  useEffect(() => {
    // Data loaded via context
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-navy-700 border-t-cyan-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400">Loading bids...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Bid History" description="View all placed bids" />
        <EmptyState
          icon={<List className="w-10 h-10 text-slate-500" />}
          title="No Auction"
          description="Create an auction first to view bid history."
          actionLabel="Create Auction"
          action={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Bid History"
        description={`All bids for "${auction.productName}"`}
        breadcrumb={[
          { label: "Dashboard", link: "/app/dashboard" },
          { label: "Bid History", link: null },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <Card className="p-4 flex-1">
          <p className="text-xs text-slate-500 uppercase">Total Bids</p>
          <p className="text-2xl font-bold text-slate-100">{bids.length}</p>
        </Card>
        {bids.length > 0 && (
          <Card className="p-4 w-64">
            <p className="text-xs text-slate-500 uppercase">Highest Bid</p>
            <p className="text-2xl font-bold text-cyan-400">
              {formatCurrency(Math.max(...bids.map((b) => b.amount)))}
            </p>
          </Card>
        )}
      </div>

      <Card className="p-0">
        <BidTable bids={bids} emptyMessage="No bids have been placed yet." />
      </Card>

      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}