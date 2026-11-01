import { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { formatCurrency } from "../utils/format";
import { Clock, Gavel, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export default function ManageAuction() {
  const { auction, bids, closeAuction, loading, error } = useAuction();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-navy-700 border-t-cyan-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Manage Auction" description="Manage your current auction" />
        <div className="text-center py-20">
          <Badge variant="warning">No Auction</Badge>
          <h2 className="text-xl font-bold text-slate-100 mt-4">No Auction to Manage</h2>
          <p className="text-slate-400">Create an auction first.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Manage Auction"
        description="Control auction state and run strategies"
        breadcrumb={[
          { label: "Dashboard", link: "/app/dashboard" },
          { label: "Manage Auction", link: null },
        ]}
      />

      <div className="mb-8 p-6 border border-navy-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{auction.productName}</h3>
            <p className="text-sm text-slate-400">{auction.description || "No description"}</p>
          </div>
          <Badge variant={auction.active ? "active" : "closed"} className="text-sm">
            {auction.active ? "Active" : "Closed"}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="p-4 bg-navy-800 rounded-lg border border-navy-700 text-center">
            <p className="text-xs text-slate-500 uppercase">Highest Bid</p>
            <p className="text-lg font-bold text-cyan-400">
              {bids.length > 0 ? formatCurrency(Math.max(...bids.map((b) => b.amount))) : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-6">Auction Controls</h3>
          <div className="space-y-4">
            {auction.active ? (
              <Button onClick={() => setCloseModalOpen(true)} variant="danger" className="w-full" disabled={loading}>
                <Clock className="w-4 h-4 mr-2" />
                Close Auction
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                <Clock className="w-4 h-4 mr-2" />
                Already Closed
              </Button>
            )}
            <Button
              asChild
              className="w-full"
              disabled={!auction.active || bids.length === 0}
            >
              <Link to="/app/strategy-analysis">
                <Trophy className="w-4 h-4 mr-2" />
                Run Strategies
              </Link>
            </Button>
            <Button
              asChild
              className="w-full"
              disabled={!auction.active || bids.length === 0}
            >
              <Link to="/app/place-bid">
                <Gavel className="w-4 h-4 mr-2" />
                Place More Bids
              </Link>
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-4">State Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Auction Status</span>
              <span className={auction.active ? "text-emerald-400" : "text-amber-400"} className="font-medium">
                {auction.active ? "Active - accepting bids" : "Closed - no new bids"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Strategy Eligibility</span>
              <span className={auction.active && bids.length > 0 ? "text-emerald-400" : "text-slate-500"} className="font-medium">
                {auction.active && bids.length > 0 ? "Close auction to run strategies" : auction.active ? "Place bids first" : "Ready for strategies"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Replacement</span>
              <span className="text-slate-500 font-medium">Create new auction to replace</span>
            </div>
            <div className="mt-4 p-3 bg-navy-900/50 rounded border border-navy-700/50">
              <p className="text-xs text-slate-500">
                Closing an auction is irreversible for the current session. Bids can no longer be placed after closure, but strategies can be run to determine winners.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-6 text-slate-300">
            Are you sure you want to close the auction for <strong>{auction.productName}</strong>?
            Once closed, no new bids will be accepted.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setCloseModalOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={() => setCloseModalOpen(false)} variant="danger" disabled={loading}>
              {loading ? "Closing..." : "Close Auction"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
