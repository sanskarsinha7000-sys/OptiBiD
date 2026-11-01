import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Check,
  CircleDollarSign,
  Gavel,
  Layers3,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { formatCurrency } from "../utils/format";

const demoBids = [
  { serial: 1, bidder: "Alex R.", amount: 55000, time: "09:41:08" },
  { serial: 2, bidder: "Sarah K.", amount: 58000, time: "09:42:16" },
  { serial: 3, bidder: "Mike T.", amount: 60000, time: "09:43:02" },
  { serial: 4, bidder: "Emma L.", amount: 62000, time: "09:44:27" },
];

const processSteps = [
  { number: "01", title: "Open a lot", detail: "Set the item and its starting price.", icon: Layers3 },
  { number: "02", title: "Gather bids", detail: "Record every offer in arrival order.", icon: Gavel },
  { number: "03", title: "Compare outcomes", detail: "See price and utility strategies side by side.", icon: BarChart3 },
];

export default function Home() {
  const [visibleBids, setVisibleBids] = useState(0);
  const reduceMotion = useReducedMotion();
  const currentBid = demoBids[visibleBids - 1];
  const chartPoints = demoBids.slice(0, visibleBids).map((bid, index) => {
    const x = 20 + (index / (demoBids.length - 1)) * 680;
    const y = 114 - ((bid.amount - 50000) / 12000) * 78;
    return { x, y };
  });
  const chartLine = chartPoints
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const chartArea = chartLine ? `${chartLine} L 700 126 L 20 126 Z` : "";

  useEffect(() => {
    if (reduceMotion) {
      setVisibleBids(demoBids.length);
      return undefined;
    }
    if (visibleBids >= demoBids.length) return undefined;

    const timer = window.setTimeout(() => {
      setVisibleBids((count) => Math.min(count + 1, demoBids.length));
    }, 850);

    return () => window.clearTimeout(timer);
  }, [reduceMotion, visibleBids]);

  return (
    <div className="home-page">
      <div className="home-frame">
        <header className="home-header">
          <Link className="home-brand" to="/" aria-label="OptiBiD home">
            <span className="home-brand-mark"><Zap aria-hidden="true" /></span>
            <span className="home-brand-copy"><strong>OptiBiD</strong><small>SMART AUCTION SYSTEM</small></span>
          </Link>
          <nav className="home-nav" aria-label="Main navigation">
            <a href="#process">How it works</a>
            <a href="#strategies">Strategies</a>
            <Link className="home-nav-cta" to="/app/dashboard">
              Open workspace <ArrowRight aria-hidden="true" />
            </Link>
          </nav>
        </header>

        <main>
          <section className="home-hero" aria-labelledby="home-title">
            <motion.div
              className="home-hero-copy"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <p className="home-kicker"><span className="home-kicker-dot" /> BID LOGIC, MADE VISIBLE</p>
              <h1 id="home-title">OptiBiD<span>Every bid counts.</span></h1>
              <p className="home-intro">
                A smart auction workspace that makes each offer traceable and every winner decision explainable.
              </p>
              <div className="home-hero-actions">
                <Link className="home-primary-action" to="/app/dashboard">
                  Enter the workspace <ArrowRight aria-hidden="true" />
                </Link>
                <a className="home-text-action" href="#live-demo">
                  Watch a sample auction <ArrowDownRight aria-hidden="true" />
                </a>
              </div>
              <div className="home-proofline">
                <span><Check aria-hidden="true" /> Ordered bid history</span>
                <span><Check aria-hidden="true" /> Explainable outcomes</span>
              </div>
            </motion.div>

            <motion.section
              id="live-demo"
              className="home-auction-demo"
              aria-label="Simulated auction preview"
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.12, ease: "easeOut" }}
            >
              <div className="demo-topbar">
                <div className="demo-window-dots" aria-hidden="true"><i /><i /><i /></div>
                <span className="demo-terminal-label">AUCTION / LOT 004</span>
                <span className="demo-mode"><span /> SIMULATED FEED</span>
              </div>
              <div className="demo-lot-heading">
                <div>
                  <p className="demo-eyebrow">CURRENT LOT</p>
                  <h2>Studio Camera Kit</h2>
                  <p>Mirrorless body · 24–70mm lens · 2 batteries</p>
                </div>
                <div className="demo-lot-icon"><CircleDollarSign aria-hidden="true" /></div>
              </div>

              <div className="demo-stats">
                <div><span>STARTING PRICE</span><strong>{formatCurrency(50000)}</strong></div>
                <div>
                  <span>HIGHEST OFFER</span>
                  <strong key={currentBid?.serial ?? "opening"} className="demo-current-bid">
                    {formatCurrency(currentBid?.amount ?? 50000)}
                  </strong>
                </div>
                <div><span>BIDS</span><strong>{String(visibleBids).padStart(2, "0")}</strong></div>
              </div>

              <div className="demo-chart-wrap">
                <div className="demo-chart-heading"><span>OFFER PROGRESSION</span><span>BY BID ORDER</span></div>
                <svg className="demo-chart" viewBox="0 0 720 140" role="img" aria-label="Animated sample bid progression chart">
                  <defs>
                    <linearGradient id="home-chart-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#87dcec" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="#87dcec" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[34, 72, 110].map((y) => <line key={y} x1="0" x2="720" y1={y} y2={y} className="demo-chart-grid" />)}
                  {chartArea && <motion.path d={chartArea} fill="url(#home-chart-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />}
                  {chartLine && (
                    <motion.path
                      d={chartLine}
                      className="demo-chart-line"
                      initial={reduceMotion ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    />
                  )}
                  {chartPoints.map(({ x, y }, index) => (
                    <motion.circle
                      key={demoBids[index].serial}
                      cx={x}
                      cy={y}
                      r="4.5"
                      className="demo-chart-point"
                      initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 280, damping: 18 }}
                    />
                  ))}
                </svg>
              </div>

              <div className="demo-feed-heading"><span>RECENT OFFERS</span><span>{visibleBids} / {demoBids.length}</span></div>
              <div className="demo-bid-list" aria-live="polite">
                <AnimatePresence initial={false}>
                  {demoBids.slice(0, visibleBids).slice(-3).reverse().map((bid, index) => (
                    <motion.div
                      key={bid.serial}
                      className={`demo-bid-row ${index === 0 ? "demo-bid-row-latest" : ""}`}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.28 }}
                    >
                      <span className="demo-bid-serial">#{String(bid.serial).padStart(2, "0")}</span>
                      <span className="demo-bidder">{bid.bidder}</span>
                      <span className="demo-bid-time">{bid.time}</span>
                      <strong>{formatCurrency(bid.amount)}</strong>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {visibleBids === 0 && <p className="demo-waiting">Waiting for the first offer<span className="demo-caret">_</span></p>}
              </div>
              <p className="demo-disclaimer"><ShieldCheck aria-hidden="true" /> Sample data for interface preview</p>
            </motion.section>
          </section>

          <section className="home-method" id="process">
            <div className="home-section-heading">
              <div><p className="home-kicker">A CLEAR PATH TO THE RESULT</p><h2>From first offer to final decision.</h2></div>
              <p>Follow the bid order, close the lot, then compare how each strategy reaches its winner.</p>
            </div>
            <div className="home-process-grid">
              {processSteps.map(({ number, title, detail, icon: Icon }, index) => (
                <motion.article
                  key={number}
                  className="home-process-step"
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.35, delay: index * 0.09 }}
                >
                  <div className="process-step-top"><span>{number}</span><Icon aria-hidden="true" /></div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </motion.article>
              ))}
            </div>
          </section>

          <section className="home-strategies" id="strategies">
            <div className="strategy-intro">
              <p className="home-kicker">TWO LENSES. ONE BID SET.</p>
              <h2>Compare the winner, not just the numbers.</h2>
              <p>Highest price favors the largest offer. Utility scoring balances offer value with bid order.</p>
            </div>
            <div className="strategy-pair">
              <article className="home-strategy-card">
                <span className="home-strategy-icon home-strategy-cyan"><Trophy aria-hidden="true" /></span>
                <div><h3>Highest price</h3><p>Choose the largest accepted offer.</p></div>
                <strong>O(n)</strong>
              </article>
              <article className="home-strategy-card">
                <span className="home-strategy-icon home-strategy-purple"><Sparkles aria-hidden="true" /></span>
                <div><h3>Utility greedy</h3><p>70% price score + 30% time score.</p></div>
                <strong>O(n)</strong>
              </article>
            </div>
          </section>
        </main>

        <footer className="home-footer">
          <Link className="home-footer-brand" to="/">OptiBiD</Link>
          <span>Smart Auction System · Greedy-Based Bid Optimization</span>
          <Link to="/app/dashboard">Open dashboard <ArrowRight aria-hidden="true" /></Link>
        </footer>
      </div>
    </div>
  );
}