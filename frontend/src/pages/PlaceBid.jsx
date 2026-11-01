import { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { showToast } from "../components/ui/Toast";
import { formatCurrency } from "../utils/format";
import { Gavel, List } from "lucide-react";
import { Link } from "react-router-dom";

export default function PlaceBid() {
  const { auction, bids, placeBid, loading, error } = useAuction();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ bidderName: "", amount: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const highestBid =
    bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : auction?.startingPrice || 0;

  const validate = () => {
    const newErrors = {};
    if (!formData.bidderName.trim()) {
      newErrors.bidderName = "Bidder name is required";
    }
    if (!formData.amount) {
      newErrors.amount = "Bid amount is required";
    } else if (parseFloat(formData.amount) <= (auction?.startingPrice || 0)) {
      newErrors.amount = `Bid must be greater than starting price (${formatCurrency(auction?.startingPrice || 0)})`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const result = await placeBid({
      bidderName: formData.bidderName.trim(),
      amount: parseFloat(formData.amount),
    });

    if (result.success) {
      setFormData({ bidderName: "", amount: "" });
      setErrors({});
      showToast("Bid placed successfully!", "success");
    } else {
      showToast(result.error || "Failed to place bid", "error");
    }
    setSubmitting(false);
  };

  if (!auction) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Place a Bid" description="Submit a bid on an active auction" />
        <div className="text-center py-20">
          <Badge variant="warning">No Active Auction</Badge>
          <h2 className="text-xl font-bold text-slate-100 mt-4">Create an auction first</h2>
          <p className="text-slate-400">You need to create an auction before placing bids.</p>
          <Button
            onClick={() => navigate("/app/create-auction")}
            className="mt-6"
          >
            Create Auction
          </Button>
        </div>
      </div>
    );
  }

  if (!auction.active) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Place a Bid" description="Submit a bid on an active auction" />
        <div className="text-center py-20">
          <Badge variant="danger">Auction Closed</Badge>
          <h2 className="text-xl font-bold text-slate-100 mt-4">Auction is Closed</h2>
          <p className="text-slate-400">No new bids can be placed on a closed auction.</p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link to="/app/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Place a Bid"
        description={`Bidding on "${auction.productName}"`}
        breadcrumb={[
          { label: "Dashboard", link: "/app/dashboard" },
          { label: "Place Bid", link: null },
        ]}
      />

      <Card className="mb-6 p-6 border-cyan-500/30 bg-cyan-500/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{auction.productName}</h3>
            <p className="text-sm text-slate-400">{auction.description || "No description"}</p>
          </div>
          <Badge variant="active">Active</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-navy-700">
          <div className="p-3 bg-navy-800 rounded-lg border border-navy-700 text-center">
            <p className="text-xs text-slate-500 uppercase">Starting Price</p>
            <p className="text-lg font-bold text-slate-100">
              {formatCurrency(auction.startingPrice)}
            </p>
          </div>
          <div className="p-3 bg-navy-800 rounded-lg border border-navy-700 text-center">
            <p className="text-xs text-slate-500 uppercase">Current Highest</p>
            <p className="text-lg font-bold text-cyan-400">
              {formatCurrency(highestBid)}
            </p>
          </div>
          <div className="p-3 bg-navy-800 rounded-lg border border-navy-700 text-center">
            <p className="text-xs text-slate-500 uppercase">Total Bids</p>
            <p className="text-lg font-bold text-slate-100">{bids.length}</p>
          </div>
          <div className="p-3 bg-navy-800 rounded-lg border border-navy-700 text-center">
            <p className="text-xs text-slate-500 uppercase">Your Bid Must Exceed</p>
            <p className="text-lg font-bold text-slate-300">
              {formatCurrency(auction.startingPrice)}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-4">
                <Gavel className="w-4 h-4 mr-2" /> Place Your Bid
              </h3>
            </div>

            <Input
              label="Bidder Name"
              placeholder="Enter your name"
              value={formData.bidderName}
              onChange={(e) => setFormData({ ...formData, bidderName: e.target.value })}
              error={errors.bidderName}
              required
            />

            <Input
              label="Bid Amount (₹)"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              error={errors.amount}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting || loading}
              className="w-full"
            >
              {submitting ? "Placing Bid..." : "Submit Bid"}
            </Button>
          </form>
        </Card>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <List className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-100">Bidding Rules</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">₹</span>
              Bid must be greater than the starting price of{' '}
              <span className="font-medium">{formatCurrency(auction.startingPrice)}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              Bidder name cannot be empty
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              Each accepted bid gets a serial number by order of placement
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              Bids are accepted only while the auction is active
            </li>
          </ul>

          {bids.length > 0 && (
            <div className="mt-6 pt-6 border-t border-navy-700">
              <h4 className="text-sm font-semibold text-slate-200 mb-3">Recent Bids</h4>
              <div className="space-y-2">
                {bids.slice(-3).reverse().map((bid) => (
                  <div key={bid.serial} className="flex justify-between p-2 bg-navy-800/50 rounded border border-navy-700/50">
                    <span className="text-sm text-slate-300">{bid.bidderName}</span>
                    <span className="text-sm font-mono text-cyan-400">{formatCurrency(bid.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}