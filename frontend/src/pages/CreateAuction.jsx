import { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { showToast } from "../components/ui/Toast";
import { formatCurrency } from "../utils/format";
import { Gavel } from "lucide-react";
import { ArrowRight } from "lucide-react";

export default function CreateAuction() {
  const { createAuction, auction, loading } = useAuction();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    startingPrice: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }
    if (!formData.startingPrice) {
      newErrors.startingPrice = "Starting price is required";
    } else if (parseFloat(formData.startingPrice) <= 0) {
      newErrors.startingPrice = "Starting price must be greater than zero";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const result = await createAuction({
      productName: formData.productName.trim(),
      description: formData.description.trim() || undefined,
      startingPrice: parseFloat(formData.startingPrice),
    });

    if (result.success) {
      showToast("Auction created successfully!", "success");
      navigate("/app/dashboard");
    } else {
      showToast(result.error || "Failed to create auction", "error");
    }
    setSubmitting(false);
  };

  const handleReset = () => {
    setFormData({ productName: "", description: "", startingPrice: "" });
    setErrors({});
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Create Auction"
        description="Set up a new auction for your product"
        breadcrumb={[
          { label: "Dashboard", link: "/app/dashboard" },
          { label: "Create Auction", link: null },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-4">Auction Details</h2>
              <p className="text-sm text-slate-400 mb-3">
                Provide information about the item you're auctioning.
              </p>
            </div>

            <Input
              label="Product Name"
              placeholder="e.g. Gaming Laptop RTX 4090"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              error={errors.productName}
              required
            />

            <Input
              label="Description (optional)"
              placeholder="Describe the item..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Input
              label="Starting Price (₹)"
              type="number"
              placeholder="0"
              value={formData.startingPrice}
              onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
              error={errors.startingPrice}
              required
            />

            <div className="pt-4 border-t border-navy-700/50">
              <Button type="submit" variant="primary" size="lg" disabled={submitting || loading} className="w-full">
                {submitting ? "Creating..." : "Create Auction"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={submitting || loading}
                className="w-full mt-2"
              >
                Reset
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-8 border-cyan-500/30 bg-cyan-500/5">
          <div className="flex items-center gap-3 mb-6">
            <Gavel className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-100">Live Preview</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-navy-800 rounded-lg border border-navy-700">
              <p className="text-xs text-slate-500 uppercase">Product</p>
              <p className="text-lg font-bold text-slate-100">
                {formData.productName || "—"}
              </p>
            </div>
            <div className="p-4 bg-navy-800 rounded-lg border border-navy-700">
              <p className="text-xs text-slate-500 uppercase">Description</p>
              <p className="text-sm text-slate-300">
                {formData.description || "No description provided"}
              </p>
            </div>
            <div className="p-4 bg-navy-800 rounded-lg border border-navy-700">
              <p className="text-xs text-slate-500 uppercase">Starting Price</p>
              <p className="text-2xl font-bold text-cyan-400">
                {formData.startingPrice ? formatCurrency(parseFloat(formData.startingPrice)) : "—"}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-navy-900/50 rounded-lg border border-navy-700">
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Validation Rules</h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>• Product name is required</li>
              <li>• Starting price must be greater than zero</li>
              <li>• Bids must exceed the starting price</li>
            </ul>
          </div>
        </Card>
      </div>

      {auction && auction.active && (
        <div className="mt-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-300">
            An active auction already exists. Creating a new one will replace it and clear all bids.
          </p>
        </div>
      )}
    </div>
  );
}