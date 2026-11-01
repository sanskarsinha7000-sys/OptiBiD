import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Zap,
  Target,
  TrendingUp,
  Trophy,
  Crown,
  ChevronRight,
  ArrowRight,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../utils/format";
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION, ROUTES } from "../utils/constants";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const navItems = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Strategies", href: "#strategies" },
];

const featureItems = [
  {
    icon: Zap,
    title: "Greedy-Based Optimization",
    desc: "Smart winner selection using utility scoring that balances price and timing.",
  },
  {
    icon: Target,
    title: "Two Winning Strategies",
    desc: "Compare highest-price and utility-based greedy approaches side by side.",
  },
  {
    icon: TrendingUp,
    title: "Linear-Time Selection",
    desc: "O(n) winner determination — fast and efficient for any bid volume.",
  },
];

const steps = [
  { step: 1, title: "Create Auction", desc: "Set up your product with a starting price and description." },
  { step: 2, title: "Place Bids", desc: "Bidders submit their bids — each gets a serial number by order." },
  { step: 3, title: "Close Auction", desc: "Close bidding when ready to determine the winner." },
  { step: 4, title: "Compare Strategies", desc: "Run both strategies and see how they differ." },
  { step: 5, title: "View Results", desc: "Review scores, winners, and detailed breakdowns." },
];

const strategyCards = [
  {
    title: "Highest-Price Strategy",
    color: "cyan",
    icon: Trophy,
    points: [
      "Highest bid amount wins",
      "Earliest bid wins on equal amounts",
      "Simple, transparent selection",
      "O(n) linear scan",
    ],
  },
  {
    title: "Utility-Based Greedy Strategy",
    color: "purple",
    icon: Crown,
    points: [
      "Price weight: 70%",
      "Time weight: 30%",
      "Rewards early bidding",
      "Greedy single-pass selection",
    ],
  },
];

const demoBids = [
  { serial: 1, bidder: "Alex R.", amount: 55000, time: "02:14" },
  { serial: 2, bidder: "Sarah K.", amount: 58000, time: "04:32" },
  { serial: 3, bidder: "Mike T.", amount: 60000, time: "06:18" },
  { serial: 4, bidder: "Emma L.", amount: 62000, time: "08:45" },
];

export default function Home() {
  const [counter, setCounter] = useState(50000);
  const [animatedBids, setAnimatedBids] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev + Math.floor(Math.random() * 500) + 100);
    }, 2000);

    const bidInterval = setInterval(() => {
      setAnimatedBids((prev) => {
        if (prev.length >= demoBids.length) return prev;
        return [...prev, demoBids[prev.length]];
      });
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(bidInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 selection:bg-cyan-500/30">
      <nav className="sticky top-0 z-40 border-b border-navy-700/50 bg-navy-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-glow">
                <Zap className="w-4 h-4 text-navy-900" />
              </div>
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                OptiBiD
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {item.name}
                </a>
              ))}
              <Link to={ROUTES.DASHBOARD} className="bg-cyan-500 hover:bg-cyan-400 text-navy-900 px-5 py-2 rounded-lg font-medium shadow-glow transition-all active:scale-95">
                Launch Dashboard
              </Link>
            </div>

            <button className="md:hidden text-slate-400 hover:text-slate-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      <main>
        <section className="relative overflow-hidden px-6 py-20 md:py-32 max-w-7xl mx-auto">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="cyan" className="mb-6 inline-flex">
                <Zap className="w-3 h-3 mr-1" /> GREEDY-POWERED AUCTION ENGINE
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight mb-6">
                {APP_TAGLINE}
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
                {APP_DESCRIPTION}. A premium auction dashboard that combines highest-price
                selection with utility-based greedy optimization for smarter bid outcomes.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to={ROUTES.DASHBOARD}>
                    Explore the Platform <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl blur opacity-30 animate-pulse" />
              <Card variant="elevated" className="relative z-10 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Gaming Laptop</h3>
                    <p className="text-sm text-slate-400">Live Demo Auction</p>
                  </div>
                  <Badge variant="warning" className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    LIVE • DEMO
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-navy-900/50 rounded-lg border border-navy-700">
                    <p className="text-xs text-slate-500 uppercase">Starting Price</p>
                    <p className="text-xl font-bold text-slate-100">₹50,000</p>
                  </div>
                  <div className="p-3 bg-navy-900/50 rounded-lg border border-navy-700">
                    <p className="text-xs text-slate-500 uppercase">Current Highest</p>
                    <p className="text-2xl font-bold text-cyan-400">{formatCurrency(counter)}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Recent Bids</p>
                  <AnimatePresence>
                    {animatedBids.map((bid) => (
                      <motion.div
                        key={bid.serial}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between p-2 bg-navy-800/50 rounded border border-navy-700/50"
                      >
                        <span className="text-sm text-slate-300">#{bid.serial} {bid.bidder}</span>
                        <span className="text-sm font-mono text-cyan-400">{formatCurrency(bid.amount)}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="pt-4 border-t border-navy-700">
                  <p className="text-xs text-slate-500 uppercase mb-2">Bid Progression</p>
                  <div className="h-24 bg-navy-900 rounded-lg border border-navy-700 relative overflow-hidden">
                    {demoBids.slice(0, animatedBids.length).map((bid, idx) => (
                      <div
                        key={idx}
                        className="absolute bottom-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                        style={{
                          width: `${((idx + 1) / demoBids.length) * 100}%`,
                          transition: "width 0.5s ease-out",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 border-y border-navy-800 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">Project Highlights</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Core features of the Smart Auction System with Greedy-Based Bid Optimization.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featureItems.map((feature) => (
              <Card key={feature.title} className="p-6 hover:border-cyan-500/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From creating an auction to comparing strategies, here's the process.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="text-center relative">
                <div className="w-12 h-12 rounded-full bg-cyan-500 text-navy-900 flex items-center justify-center mx-auto mb-4 font-bold shadow-glow relative z-10">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                {step.step < steps.length && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-navy-700" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="strategies" className="py-20 border-y border-navy-800 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">Winner Selection Strategies</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Two distinct strategies for determining auction winners, each with its own logic.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {strategyCards.map((card) => (
              <Card key={card.title} className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <card.icon className={`w-6 h-6 ${card.color === "cyan" ? "text-cyan-400" : "text-purple-400"}`} />
                  <h3 className="text-xl font-bold text-slate-100">{card.title}</h3>
                </div>
                <ul className="space-y-3 mb-8">
                  {card.points.map((point, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-300 text-sm">
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-navy-800/50 border border-navy-700 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Ready to Start?</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Experience the power of greedy-based bid optimization for yourself.
            </p>
            <Button size="lg" asChild>
              <Link to={ROUTES.DASHBOARD}>Launch Dashboard</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-navy-800 bg-navy-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-3 h-3 text-navy-900" />
              </div>
              <span className="font-bold text-slate-100">OptiBiD</span>
            </div>
            <p className="text-slate-500 text-sm">
              {APP_DESCRIPTION} — Built for academic demonstration.
            </p>
            <div className="flex gap-4 text-sm text-slate-500">
              <span>React • Vite • Tailwind CSS</span>
              <span>C++17 • Greedy Algorithm</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
