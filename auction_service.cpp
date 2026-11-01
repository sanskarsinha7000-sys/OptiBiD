#include "auction_service.hpp"

#include <algorithm>
#include <cmath>

namespace optibid {
namespace {

std::string trim(const std::string& value) {
    const std::size_t first = value.find_first_not_of(" \t\r\n");
    if (first == std::string::npos) return {};
    const std::size_t last = value.find_last_not_of(" \t\r\n");
    return value.substr(first, last - first + 1);
}

double highestBidAmount(const std::vector<Bid>& bids) {
    double highest = 0.0;
    for (const Bid& bid : bids) highest = std::max(highest, bid.amount);
    return highest;
}

void scoreBids(std::vector<Bid>& bids) {
    if (bids.empty()) return;

    const double maximum = highestBidAmount(bids);
    const std::size_t count = bids.size();
    for (std::size_t position = 0; position < count; ++position) {
        Bid& bid = bids[position];
        bid.priceScore = (bid.amount / maximum) * 100.0;
        bid.timeScore = 100.0 * static_cast<double>(count - position)
            / static_cast<double>(count);
        bid.utilityScore = WEIGHT_PRICE * bid.priceScore + WEIGHT_TIME * bid.timeScore;
    }
}

int findHighestPriceWinner(const std::vector<Bid>& bids) {
    if (bids.empty()) return -1;

    std::size_t best = 0;
    for (std::size_t index = 1; index < bids.size(); ++index) {
        if (bids[index].amount > bids[best].amount) best = index;
    }
    return static_cast<int>(best);
}

int findUtilityWinner(const std::vector<Bid>& bids) {
    if (bids.empty()) return -1;

    std::size_t best = 0;
    for (std::size_t index = 1; index < bids.size(); ++index) {
        const double candidate = bids[index].utilityScore;
        const double current = bids[best].utilityScore;
        if (candidate > current + EPSILON) {
            best = index;
        } else if (std::fabs(candidate - current) <= EPSILON
            && bids[index].amount > bids[best].amount) {
            best = index;
        }
    }
    return static_cast<int>(best);
}

StrategyResult makeResult(const std::vector<Bid>& bids, int position, bool withUtility) {
    StrategyResult result;
    result.calculated = true;
    if (position < 0) return result;

    const Bid& bid = bids[static_cast<std::size_t>(position)];
    result.hasWinner = true;
    result.serial = bid.serial;
    result.winnerName = bid.bidderName;
    result.amount = bid.amount;
    if (withUtility) result.utilityScore = bid.utilityScore;
    return result;
}

} // namespace

ServiceResult<Auction> AuctionService::createAuction(const CreateAuctionRequest& request) {
    const std::string productName = trim(request.productName);
    const std::string description = trim(request.description);

    if (productName.empty()) {
        return ServiceResult<Auction>::fail("Product name must not be empty.");
    }
    if (!std::isfinite(request.startingPrice) || request.startingPrice <= 0.0) {
        return ServiceResult<Auction>::fail("Starting price must be greater than zero.");
    }
    if (auction_ && !request.replaceExisting) {
        return ServiceResult<Auction>::fail(
            "An auction already exists. Explicit replacement is required.");
    }

    Auction replacement;
    replacement.productName = productName;
    replacement.description = description.empty() ? "N/A" : description;
    replacement.startingPrice = request.startingPrice;
    replacement.active = true;

    auction_ = replacement;
    bids_.clear();
    return ServiceResult<Auction>::ok(replacement);
}

ServiceResult<std::optional<Auction>> AuctionService::getAuction() const {
    return ServiceResult<std::optional<Auction>>::ok(auction_);
}

ServiceResult<std::vector<Bid>> AuctionService::getBids() const {
    return ServiceResult<std::vector<Bid>>::ok(bids_);
}

ServiceResult<Bid> AuctionService::placeBid(const PlaceBidRequest& request) {
    if (!auction_) {
        return ServiceResult<Bid>::fail("No auction exists yet. Create one first.");
    }
    if (!auction_->active) {
        return ServiceResult<Bid>::fail("Auction is closed. No new bids accepted.");
    }

    const std::string bidderName = trim(request.bidderName);
    if (bidderName.empty()) {
        return ServiceResult<Bid>::fail("Bidder name must not be empty.");
    }
    if (!std::isfinite(request.amount) || request.amount <= auction_->startingPrice) {
        return ServiceResult<Bid>::fail(
            "Bid must be greater than the starting price.");
    }
    if (REQUIRE_HIGHER_THAN_CURRENT_HIGHEST && request.amount <= highestBidAmount(bids_)) {
        return ServiceResult<Bid>::fail(
            "Bid must be greater than the current highest bid.");
    }

    Bid bid;
    bid.serial = static_cast<int>(bids_.size()) + 1;
    bid.bidderName = bidderName;
    bid.amount = request.amount;
    bids_.push_back(bid);
    return ServiceResult<Bid>::ok(bid);
}

ServiceResult<Auction> AuctionService::closeAuction() {
    if (!auction_) {
        return ServiceResult<Auction>::fail("No auction exists yet.");
    }
    if (!auction_->active) {
        return ServiceResult<Auction>::fail("Auction is already closed.");
    }

    auction_->active = false;
    return ServiceResult<Auction>::ok(*auction_);
}

std::string AuctionService::closedAuctionError() const {
    if (!auction_) return "No auction exists yet. Create one first.";
    if (auction_->active) return "Auction is still active. Close it first.";
    return {};
}

ServiceResult<StrategyResult> AuctionService::calculateHighestPriceStrategy() {
    const std::string error = closedAuctionError();
    if (!error.empty()) return ServiceResult<StrategyResult>::fail(error);

    const int winner = findHighestPriceWinner(bids_);
    auction_->priceResult = makeResult(bids_, winner, false);
    return ServiceResult<StrategyResult>::ok(auction_->priceResult);
}

ServiceResult<StrategyResult> AuctionService::calculateUtilityGreedyStrategy() {
    const std::string error = closedAuctionError();
    if (!error.empty()) return ServiceResult<StrategyResult>::fail(error);

    scoreBids(bids_);
    const int winner = findUtilityWinner(bids_);
    auction_->utilityResult = makeResult(bids_, winner, true);
    return ServiceResult<StrategyResult>::ok(auction_->utilityResult);
}

ServiceResult<CompareResult> AuctionService::compareStrategies() {
    const std::string error = closedAuctionError();
    if (!error.empty()) return ServiceResult<CompareResult>::fail(error);

    CompareResult comparison;
    if (bids_.empty()) {
        auction_->priceResult = makeResult(bids_, -1, false);
        auction_->utilityResult = makeResult(bids_, -1, true);
        comparison.priceWinner = auction_->priceResult;
        comparison.utilityWinner = auction_->utilityResult;
        return ServiceResult<CompareResult>::ok(comparison);
    }

    scoreBids(bids_);
    const int priceWinner = findHighestPriceWinner(bids_);
    const int utilityWinner = findUtilityWinner(bids_);
    auction_->priceResult = makeResult(bids_, priceWinner, false);
    auction_->utilityResult = makeResult(bids_, utilityWinner, true);

    comparison.priceWinner = auction_->priceResult;
    comparison.utilityWinner = auction_->utilityResult;
    comparison.bids = bids_;
    comparison.explanation = priceWinner == utilityWinner
        ? "Both strategies picked the same bidder. The highest bid was also good enough on timing to get the best overall score."
        : "The winners differ because the highest-price strategy looks only at the amount, while the utility strategy also rewards bidding earlier (30%).";
    return ServiceResult<CompareResult>::ok(comparison);
}

ServiceResult<ResultsSnapshot> AuctionService::getResults() const {
    ResultsSnapshot results;
    results.auction = auction_;
    results.bids = bids_;
    if (auction_) {
        results.priceResult = auction_->priceResult;
        results.utilityResult = auction_->utilityResult;
        results.strategiesCalculated = auction_->priceResult.calculated
            || auction_->utilityResult.calculated;
    }
    return ServiceResult<ResultsSnapshot>::ok(results);
}

} // namespace optibid