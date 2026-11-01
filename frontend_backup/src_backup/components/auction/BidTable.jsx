import { formatCurrency, formatDate } from "../../utils/format";

const BidTable = ({ bids, emptyMessage = "No bids placed yet." }) => {
  if (!bids || bids.length === 0) {
    return (
      <div className="bg-navy-800 border border-navy-700 rounded-xl p-8 text-center">
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-navy-700 bg-navy-700/50">
            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Serial
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Bidder
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Time
            </th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid) => (
            <tr key={bid.serial} className="border-b border-navy-700/50 hover:bg-navy-700/30 transition-colors">
              <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                #{bid.serial}
              </td>
              <td className="px-6 py-4 text-sm text-slate-200">{bid.bidderName}</td>
              <td className="px-6 py-4 text-sm text-cyan-400 font-medium">
                {formatCurrency(bid.amount)}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {formatDate(bid.createdAt || new Date().toISOString())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

BidTable.displayName = "BidTable";
export default BidTable;