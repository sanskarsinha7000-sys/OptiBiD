import { UTILITY_WEIGHTS, EPSILON } from "../utils/constants";

const initialState = {
  auction: null,
  bids: [],
  priceResult: null,
  utilityResult: null,
  strategiesCalculated: false,
};

let state = { ...initialState };

const calculatePriceScore = (amount, maxAmount) => {
  if (!maxAmount || maxAmount === 0) return 0;
  return (amount / maxAmount) * 100;
};

const calculateTimeScore = (position, total) => {
  if (total === 0) return 100;
  return (100 * (total - position)) / total;
};

const calculateUtilityScore = (priceScore, timeScore) => {
  return UTILITY_WEIGHTS.price * priceScore + UTILITY_WEIGHTS.time * timeScore;
};

const computeScores = (bids) => {
  if (bids.length === 0) return bids;
  const maxAmount = Math.max(...bids.map((b) => b.amount));
  return bids.map((bid, pos) => {
    const priceScore = calculatePriceScore(bid.amount, maxAmount);
    const timeScore = calculateTimeScore(pos, bids.length);
    const utilityScore = calculateUtilityScore(priceScore, timeScore);
    return { ...bid, priceScore, timeScore, utilityScore };
  });
};

const findHighestPriceWinner = (bids) => {
  if (bids.length === 0) return null;
  let bestIdx = 0;
  for (let i = 1; i < bids.length; i++) {
    if (bids[i].amount > bids[bestIdx].amount) bestIdx = i;
  }
  return bids[bestIdx];
};

const findUtilityWinner = (scoredBids) => {
  if (scoredBids.length === 0) return null;
  let bestIdx = 0;
  for (let i = 1; i < scoredBids.length; i++) {
    const a = scoredBids[i].utilityScore;
    const b = scoredBids[bestIdx].utilityScore;
    if (a > b + EPSILON) {
      bestIdx = i;
    } else if (Math.abs(a - b) <= EPSILON) {
      if (scoredBids[i].amount > scoredBids[bestIdx].amount) bestIdx = i;
    }
  }
  return scoredBids[bestIdx];
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockApi = {
  request: async (endpoint, options = {}) => {
    await delay(400);
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : null;

    if (endpoint === "/auction" && method === "GET") {
      return { success: true, data: state.auction || null, mock: true };
    }

    if (endpoint === "/auction" && method === "POST") {
      state.auction = {
        productName: body.productName,
        description: body.description || "N/A",
        startingPrice: body.startingPrice,
        active: true,
        createdAt: new Date().toISOString(),
      };
      state.bids = [];
      state.priceResult = null;
      state.utilityResult = null;
      state.strategiesCalculated = false;
      return { success: true, data: state.auction, mock: true };
    }

    if (endpoint === "/bids" && method === "POST") {
      if (!state.auction) {
        return { success: false, error: "No auction exists. Create one first.", mock: true };
      }
      if (!state.auction.active) {
        return { success: false, error: "Auction is closed. No new bids accepted.", mock: true };
      }
      if (!body.bidderName || body.bidderName.trim() === "") {
        return { success: false, error: "Bidder name must not be empty.", mock: true };
      }
      if (body.amount <= state.auction.startingPrice) {
        return {
          success: false,
          error: `Bid must be greater than the starting price (${state.auction.startingPrice}).`,
          mock: true,
        };
      }
      const bid = {
        serial: state.bids.length + 1,
        bidderName: body.bidderName.trim(),
        amount: body.amount,
        createdAt: new Date().toISOString(),
      };
      state.bids.push(bid);
      return { success: true, data: bid, mock: true };
    }

    if (endpoint === "/bids" && method === "GET") {
      return { success: true, data: state.bids, mock: true };
    }

    if (endpoint === "/auction/close" && method === "POST") {
      if (!state.auction) {
        return { success: false, error: "No auction exists.", mock: true };
      }
      if (!state.auction.active) {
        return { success: false, error: "Auction is already closed.", mock: true };
      }
      state.auction.active = false;
      return { success: true, data: state.auction, mock: true };
    }

    if (endpoint === "/strategy/price" && method === "POST") {
      if (!state.auction || state.auction.active) {
        return { success: false, error: "Auction must be closed first.", mock: true };
      }
      if (state.bids.length === 0) {
        return { success: false, error: "No bids found.", mock: true };
      }
      const winner = findHighestPriceWinner(state.bids);
      state.priceResult = {
        calculated: true, hasWinner: true, serial: winner.serial,
        winnerName: winner.bidderName, amount: winner.amount,
      };
      state.strategiesCalculated = true;
      return { success: true, data: state.priceResult, mock: true };
    }

    if (endpoint === "/strategy/utility" && method === "POST") {
      if (!state.auction || state.auction.active) {
        return { success: false, error: "Auction must be closed first.", mock: true };
      }
      if (state.bids.length === 0) {
        return { success: false, error: "No bids found.", mock: true };
      }
      const scoredBids = computeScores(state.bids);
      const winner = findUtilityWinner(scoredBids);
      const winnerBid = scoredBids.find((b) => b.serial === winner.serial);
      state.utilityResult = {
        calculated: true, hasWinner: true, serial: winner.serial,
        winnerName: winner.bidderName, amount: winner.amount,
        utilityScore: winnerBid.utilityScore,
      };
      state.strategiesCalculated = true;
      return { success: true, data: state.utilityResult, mock: true };
    }

    if (endpoint === "/strategy/compare" && method === "POST") {
      if (!state.auction || state.auction.active) {
        return { success: false, error: "Auction must be closed first.", mock: true };
      }
      if (state.bids.length === 0) {
        return { success: false, error: "No bids found.", mock: true };
      }
      const scoredBids = computeScores(state.bids);
      const priceWinner = findHighestPriceWinner(state.bids);
      const utilityWinner = findUtilityWinner(scoredBids);
      state.priceResult = {
        calculated: true, hasWinner: true, serial: priceWinner.serial,
        winnerName: priceWinner.bidderName, amount: priceWinner.amount,
      };
      const utilityWinnerBid = scoredBids.find((b) => b.serial === utilityWinner.serial);
      state.utilityResult = {
        calculated: true, hasWinner: true, serial: utilityWinner.serial,
        winnerName: utilityWinner.bidderName, amount: utilityWinner.amount,
        utilityScore: utilityWinnerBid.utilityScore,
      };
      state.strategiesCalculated = true;
      return {
        success: true,
        data: {
          priceWinner: state.priceResult,
          utilityWinner: state.utilityResult,
          bids: scoredBids,
          explanation: priceWinner.serial === utilityWinner.serial
            ? "Both strategies picked the same bidder. The highest bid was also good enough on timing to get the best overall score."
            : "The winners differ because the highest-price strategy looks only at the amount, while the utility strategy also rewards bidding earlier (30%).",
        },
        mock: true,
      };
    }

    if (endpoint === "/results" && method === "GET") {
      return {
        success: true,
        data: {
          auction: state.auction,
          priceResult: state.priceResult || { calculated: false, hasWinner: false },
          utilityResult: state.utilityResult || { calculated: false, hasWinner: false },
          strategiesCalculated: state.strategiesCalculated,
          bids: state.bids,
        },
        mock: true,
      };
    }

    return { success: false, error: "Unknown endpoint", mock: true };
  },
};

export default mockApi;