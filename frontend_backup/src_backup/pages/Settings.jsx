import { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { UTILITY_WEIGHTS } from "../utils/constants";

export default function Settings() {
  const [priceWeight, setPriceWeight] = useState(UTILITY_WEIGHTS.price);
  const [timeWeight, setTimeWeight] = useState(UTILITY_WEIGHTS.time);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalWeight = priceWeight + timeWeight;
  const weightsValid = Math.abs(totalWeight - 1.0) < 0.001;

  const handleSave = () => {
    if (!weightsValid) {
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaved(true);
      setSaving(false);
    }, 300);
  };

  const handleReset = () => {
    setPriceWeight(UTILITY_WEIGHTS.price);
    setTimeWeight(UTILITY_WEIGHTS.time);
    setSaved(false);
return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Settings"
        description="Configure auction preferences and utility weights"
        breadcrumb={[
          { label: "Dashboard", link: "/app/dashboard" },
          { label: "Settings", link: null },
        ]}
      />

      <Card className="mb-6 p-6 border-purple-500/30 bg-purple-500/5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">Frontend Development Mode</h3>
            <p className="text-xs text-purple-300">
              The C++ HTTP backend is not yet connected. Settings are stored locally and
              will be applied when the backend API is integrated.
            </p>
          </div>
        </div>
      </Card>

      <Card className="mb-6 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-100">Utility Score Weights</h3>
          </div>
          <Badge variant="info">
            Price: 70% | Time: 30%
          </Badge>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Price Weight</label>
              <span className="text-xs font-mono text-cyan-400">{priceWeight}</span>
            </div>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={priceWeight}
              onChange={(e) => setPriceWeight(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Time Weight</label>
              <span className="text-xs font-mono text-purple-400">{timeWeight}</span>
            </div>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={timeWeight}
              onChange={(e) => setTimeWeight(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="p-3 bg-navy-800/50 rounded-lg border border-navy-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-400">Total Weight</span>
              <span className={`text-xs font-mono ${weightsValid ? "text-emerald-400" : "text-red-400"}`}>
                {totalWeight.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Weights should total 1.0 (100%). These are used in the utility formula:
              utility = priceWeight × priceScore + timeWeight × timeScore.
            </p>
          </div>

          <div className="pt-4 border-t border-navy-700/50">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={false}
                onChange={() => {}}
                className="rounded bg-navy-700 border-navy-600 text-cyan-500 focus:ring-cyan-500"
              />
              <label className="text-xs font-semibold text-slate-400">
                Require bids to exceed current highest bid
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Currently disabled in the C++ backend. Bids only need to exceed the starting price.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={handleSave} disabled={!weightsValid} className="w-full">
            {saved ? "Saved!" : "Save Settings"}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 border-navy-700">
        <h3 className="text-lg font-bold text-slate-100 mb-4">About OptiBiD</h3>
        <div className="space-y-3 text-sm text-slate-400">
          <p>
            <strong>Project:</strong> Smart Auction System with Greedy-Based Bid Optimization
          </p>
          <p>
            <strong>Tagline:</strong> "Every Bid Counts. Every Decision Matters."
          </p>
          <p>
            <strong>Frontend:</strong> React + Vite + Tailwind CSS
          </p>
          <p>
            <strong>Backend:</strong> C++17 (console application)
          </p>
          <p>
            <strong>Algorithm:</strong> Greedy-based bid optimization with utility scoring
          </p>
        </div>
      </Card>
    </div>
  );
}
  };