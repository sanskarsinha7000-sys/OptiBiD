import { useAuction } from "../context/AuctionContext";
import BidTable from "../components/auction/BidTable";
import { formatCurrency } from "../utils/format";
import {
  Activity,
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  Gavel,
  Plus,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { auction, bids, loading, error, priceResult, utilityResult } = useAuction();
  const bidCount = bids?.length ?? 0;
  const highestBid = bidCount > 0
    ? bids.reduce((highest, bid) => Math.max(highest, Number(bid.amount) || 0), 0)
    : null;
  const chartMaximum = Math.max(...(bids || []).map((bid) => Number(bid.amount) || 0), 1);
  const chartPoints = (bids || []).map((bid, index) => {
    const x = bids.length === 1 ? 150 : 16 + (index / (bids.length - 1)) * 268;
    const y = 76 - ((Number(bid.amount) || 0) / chartMaximum) * 54;
    return { x, y, bid };
  });
  const chartLine = chartPoints.map(({ x, y }) => `${x},${y}`).join(" ");
  if (loading) {
    return (
      <div className="dashboard-loading" role="status">
        <span className="dashboard-spinner" />
        <span>Loading auction data</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-heading">
        <div>
          <p className="dashboard-eyebrow">AUCTION OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="dashboard-description">
            {auction ? auction.productName : "Manage your auctions and bidder activity."}
          </p>
        </div>
        <Link className="dashboard-primary-action" to="/app/create-auction">
          <Plus aria-hidden="true" />
          New auction
        </Link>
      </header>

      <section className="dashboard-metrics" aria-label="Auction metrics">
        <article className="dashboard-panel metric-panel">
          <div className="metric-heading"><span>AUCTION STATUS</span><Activity aria-hidden="true" /></div>
          <div className="metric-status">
            <span className={`status-dot ${auction?.active ? "status-dot-live" : ""}`} />
            {auction ? (auction.active ? "Live auction" : "Auction closed") : "No active auction"}
          </div>
          <p className="metric-footnote">{auction?.productName || "Create an auction to start tracking activity"}</p>
        </article>

        <article className="dashboard-panel metric-panel">
          <div className="metric-heading"><span>BIDS PLACED</span><Gavel aria-hidden="true" /></div>
          <strong className="metric-value">{bidCount}</strong>
          <p className="metric-footnote">{bidCount === 1 ? "Recorded bid" : "Recorded bids"}</p>
        </article>

        <article className="dashboard-panel metric-panel">
          <div className="metric-heading"><span>HIGHEST BID</span><CircleDollarSign aria-hidden="true" /></div>
          <strong className="metric-value metric-value-cyan">
            {highestBid === null ? "—" : formatCurrency(highestBid)}
          </strong>
          <p className="metric-footnote">
            {auction ? `Opening price ${formatCurrency(auction.startingPrice)}` : "No bids to compare"}
          </p>
        </article>

        <article className="dashboard-panel activity-panel">
          <div className="metric-heading">
            <span>BID ACTIVITY</span>
            <span className="activity-period">BY BID ORDER</span>
          </div>
          {chartPoints.length > 0 ? (
            <svg className="activity-chart" viewBox="0 0 300 90" role="img" aria-label="Bid amounts by bid order">
              <defs>
                <linearGradient id="activity-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#78d7e8" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#78d7e8" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 50, 75].map((y) => (
                <line key={y} x1="0" x2="300" y1={y} y2={y} className="activity-gridline" />
              ))}
              {chartPoints.length > 1 && (
                <>
                  <polygon points={`0,90 ${chartLine} 300,90`} fill="url(#activity-fill)" />
                  <polyline points={chartLine} className="activity-line" />
                </>
              )}
              {chartPoints.map(({ x, y, bid }) => (
                <circle key={bid.serial} cx={x} cy={y} r="3.5" className="activity-point" />
              ))}
            </svg>
          ) : (
            <div className="activity-empty"><span>No bid activity yet</span></div>
          )}
          <div className="activity-caption">
            <span>{bidCount} {bidCount === 1 ? "bid" : "bids"}</span>
            <span>{highestBid === null ? "Waiting for first bid" : formatCurrency(highestBid)}</span>
          </div>
        </article>
      </section>

      <section className="dashboard-detail-grid">
        <article className="dashboard-panel auction-panel">
          <div className="panel-heading">
            <div>
              <p className="dashboard-eyebrow">CURRENT LOT</p>
              <h2>{auction?.productName || "No auction created"}</h2>
            </div>
            {auction && (
              <span className={`auction-state ${auction.active ? "auction-state-live" : ""}`}>
                <span className="status-dot" />
                {auction.active ? "Accepting bids" : "Closed"}
              </span>
            )}
          </div>
          <p className="auction-description">
            {auction?.description || "Create an auction to see its starting price, bid activity, and results here."}
          </p>
          {auction ? (
            <div className="auction-facts">
              <div><span>Starting price</span><strong>{formatCurrency(auction.startingPrice)}</strong></div>
              <div><span>Highest bid</span><strong>{highestBid === null ? "—" : formatCurrency(highestBid)}</strong></div>
              <div><span>Total bids</span><strong>{bidCount}</strong></div>
            </div>
          ) : (
            <Link className="inline-action" to="/app/create-auction">
              Create your first auction <ArrowUpRight aria-hidden="true" />
            </Link>
          )}
          {auction?.active && (
            <Link className="auction-cta" to="/app/place-bid">
              <Gavel aria-hidden="true" /> Place a bid
            </Link>
          )}
        </article>

        <article className="dashboard-panel strategy-panel">
          <div className="panel-heading">
            <div>
              <p className="dashboard-eyebrow">WINNER SELECTION</p>
              <h2>Strategy outcomes</h2>
            </div>
            <Trophy className="panel-heading-icon" aria-hidden="true" />
          </div>
          <div className="strategy-result-row">
            <span className="strategy-icon strategy-icon-cyan"><CircleDollarSign aria-hidden="true" /></span>
            <span className="strategy-copy"><strong>Highest price</strong><small>{priceResult?.calculated ? priceResult.winnerName : "Not calculated"}</small></span>
            <strong className="strategy-amount">{priceResult?.calculated ? formatCurrency(priceResult.amount) : "—"}</strong>
          </div>
          <div className="strategy-result-row">
            <span className="strategy-icon strategy-icon-purple"><Trophy aria-hidden="true" /></span>
            <span className="strategy-copy"><strong>Utility greedy</strong><small>{utilityResult?.calculated ? utilityResult.winnerName : "Not calculated"}</small></span>
            <strong className="strategy-amount">{utilityResult?.calculated ? formatCurrency(utilityResult.amount) : "—"}</strong>
          </div>
          <Link className="inline-action" to="/app/strategy-analysis">
            View strategy analysis <ArrowUpRight aria-hidden="true" />
          </Link>
        </article>
      </section>

      <section className="dashboard-panel bids-panel">
        <div className="panel-heading bids-heading">
          <div>
            <p className="dashboard-eyebrow">LIVE AUCTION</p>
            <h2>Recent bids</h2>
          </div>
          <div className="bids-heading-actions">
            <span className="bid-count-label"><Clock3 aria-hidden="true" /> {bidCount} total</span>
            <Link className="inline-action" to="/app/bid-history">
              View all <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <BidTable bids={[...(bids || [])].reverse().slice(0, 5)} />
      </section>

      {error && <p className="dashboard-error" role="alert">{error}</p>}
    </div>
  );
}