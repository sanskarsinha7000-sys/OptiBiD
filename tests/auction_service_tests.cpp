#include "../auction_service.hpp"

#include <cmath>
#include <cstdlib>
#include <iostream>
#include <limits>
#include <string>
#include <vector>

using namespace optibid;

namespace {

int checks = 0;

void check(bool condition, const std::string& message) {
    ++checks;
    if (!condition) {
        std::cerr << "FAIL: " << message << '\n';
        std::exit(1);
    }
}

bool near(double actual, double expected, double tolerance = 1e-9) {
    return std::fabs(actual - expected) <= tolerance;
}

AuctionService makeClosedAuction(const std::vector<double>& amounts) {
    AuctionService service;
    auto created = service.createAuction({"Test Lot", "Service test", 50.0, false});
    check(created.success, "create test auction");
    for (std::size_t index = 0; index < amounts.size(); ++index) {
        auto bid = service.placeBid({"Bidder " + std::to_string(index + 1), amounts[index]});
        check(bid.success, "place test bid " + std::to_string(index + 1));
    }
    auto closed = service.closeAuction();
    check(closed.success && !closed.data.active, "close test auction");
    return service;
}

} // namespace

int main() {
    {
        AuctionService service;
        auto missing = service.getAuction();
        check(missing.success && !missing.data.has_value(), "empty service has no auction");
        check(service.getBids().data.empty(), "empty service has no bids");
        auto results = service.getResults();
        check(results.success && !results.data.auction.has_value(), "empty result snapshot has no auction");
        check(!results.data.strategiesCalculated, "empty result snapshot is not calculated");

        auto emptyName = service.createAuction({" \t ", "Description", 10.0, false});
        check(!emptyName.success && !emptyName.error.empty(), "reject empty product name");
        auto zeroPrice = service.createAuction({"Lot", "Description", 0.0, false});
        check(!zeroPrice.success, "reject zero starting price");
        auto infinitePrice = service.createAuction({"Lot", "Description", std::numeric_limits<double>::infinity(), false});
        check(!infinitePrice.success, "reject non-finite starting price");

        auto created = service.createAuction({"  Camera Kit  ", "  Body and lens  ", 50.0, false});
        check(created.success, "create valid auction");
        check(created.data.productName == "Camera Kit", "trim product name");
        check(created.data.description == "Body and lens", "trim description");
        check(created.data.active, "new auction is active");
        auto duplicate = service.createAuction({"Replacement", "", 25.0, false});
        check(!duplicate.success, "reject implicit replacement");
        check(service.getAuction().data->productName == "Camera Kit", "failed replacement preserves current auction");

        auto noAuctionBid = AuctionService().placeBid({"Bidder", 60.0});
        check(!noAuctionBid.success, "reject bid when no auction exists");
        auto blankBidder = service.placeBid({"  ", 60.0});
        check(!blankBidder.success, "reject empty bidder name");
        auto equalStart = service.placeBid({"Bidder", 50.0});
        check(!equalStart.success, "reject bid equal to starting price");
        auto belowStart = service.placeBid({"Bidder", 49.0});
        check(!belowStart.success, "reject bid below starting price");
        auto infiniteBid = service.placeBid({"Bidder", std::numeric_limits<double>::infinity()});
        check(!infiniteBid.success, "reject non-finite bid amount");

        auto first = service.placeBid({"  First  ", 90.0});
        auto second = service.placeBid({"Second", 70.0});
        check(first.success && first.data.serial == 1, "first accepted bid serial is one");
        check(first.data.bidderName == "First", "trim bidder name");
        check(second.success && second.data.serial == 2, "second accepted bid serial is sequential");
        check(second.data.amount < first.data.amount, "allow a later bid below current highest");

        auto beforeClosePrice = service.calculateHighestPriceStrategy();
        auto beforeCloseUtility = service.calculateUtilityGreedyStrategy();
        auto beforeCloseCompare = service.compareStrategies();
        check(!beforeClosePrice.success, "price strategy requires closed auction");
        check(!beforeCloseUtility.success, "utility strategy requires closed auction");
        check(!beforeCloseCompare.success, "comparison requires closed auction");

        auto closed = service.closeAuction();
        check(closed.success && !closed.data.active, "close active auction");
        auto closeAgain = service.closeAuction();
        check(!closeAgain.success, "reject closing an already closed auction");
        auto afterCloseBid = service.placeBid({"Late bidder", 100.0});
        check(!afterCloseBid.success, "reject bid after closing auction");

        auto scoresBefore = service.getBids();
        check(scoresBefore.data[0].priceScore == 0.0 && scoresBefore.data[0].utilityScore == 0.0,
            "read bids does not calculate or mutate scores");
        auto price = service.calculateHighestPriceStrategy();
        check(price.success && price.data.hasWinner && price.data.serial == 1,
            "highest-price strategy returns winning bid");
        auto scoresAfterPrice = service.getBids();
        check(scoresAfterPrice.data[0].utilityScore == 0.0,
            "price strategy leaves bid scores unchanged");
    }

    {
        AuctionService service = makeClosedAuction({100.0, 110.0});
        auto utility = service.calculateUtilityGreedyStrategy();
        check(utility.success && utility.data.hasWinner && utility.data.serial == 1,
            "utility strategy can prefer the earlier bid");
        check(near(utility.data.utilityScore, 93.63636363636364), "utility winner score formula");
        auto bids = service.getBids();
        check(near(bids.data[0].priceScore, (100.0 / 110.0) * 100.0), "price score formula");
        check(near(bids.data[0].timeScore, 100.0), "first bid time score formula");
        check(near(bids.data[1].timeScore, 50.0), "second bid time score formula");
    }

    {
        AuctionService service = makeClosedAuction({80.0, 120.0, 120.0});
        auto price = service.calculateHighestPriceStrategy();
        check(price.success && price.data.serial == 2,
            "highest-price tie retains earlier equal-amount bid");
    }

    {
        AuctionService service = makeClosedAuction({110.0, 140.0});
        auto utility = service.calculateUtilityGreedyStrategy();
        check(utility.success && near(utility.data.utilityScore, 85.0),
            "construct equal utility scores within EPSILON");
        check(utility.data.serial == 2,
            "utility tie within EPSILON prefers higher bid amount");
    }

    {
        AuctionService service = makeClosedAuction({100.0, 110.0, 125.0});
        auto comparison = service.compareStrategies();
        check(comparison.success, "compare strategies succeeds");
        check(comparison.data.priceWinner.calculated && comparison.data.priceWinner.serial == 3,
            "comparison includes highest-price result");
        check(comparison.data.utilityWinner.calculated && comparison.data.utilityWinner.serial == 1,
            "comparison includes utility result");
        check(comparison.data.bids.size() == 3, "comparison returns scored bid set");
        check(comparison.data.bids[0].utilityScore > 0.0, "comparison returns calculated scores");
        check(service.getBids().data[0].utilityScore > 0.0,
            "utility comparison stores scores on service bids");
        check(!comparison.data.explanation.empty(), "comparison includes explanation");
    }

    {
        AuctionService service;
        auto created = service.createAuction({"Empty Lot", "", 10.0, false});
        check(created.success, "create empty-bid auction");
        check(service.closeAuction().success, "close empty-bid auction");
        auto price = service.calculateHighestPriceStrategy();
        auto utility = service.calculateUtilityGreedyStrategy();
        auto comparison = service.compareStrategies();
        check(price.success && price.data.calculated && !price.data.hasWinner,
            "empty-bid price strategy is calculated without a winner");
        check(utility.success && utility.data.calculated && !utility.data.hasWinner,
            "empty-bid utility strategy is calculated without a winner");
        check(comparison.success && comparison.data.priceWinner.calculated
            && comparison.data.utilityWinner.calculated,
            "empty-bid comparison is calculated without failing");
        auto results = service.getResults();
        check(results.success && results.data.strategiesCalculated,
            "empty-bid strategy results are reflected in snapshot");
        check(!results.data.priceResult.hasWinner && !results.data.utilityResult.hasWinner,
            "empty-bid result snapshot retains no-winner states");

        auto replacementRequired = service.createAuction({"Next Lot", "", 20.0, false});
        check(!replacementRequired.success, "require explicit replacement flag");
        auto replaced = service.createAuction({"Next Lot", "", 20.0, true});
        check(replaced.success && replaced.data.active, "allow explicitly requested replacement");
        check(service.getBids().data.empty(), "replacement clears old bids");
        auto replacementResults = service.getResults();
        check(!replacementResults.data.strategiesCalculated,
            "replacement resets prior strategy results");
    }

    std::cout << "PASS: " << checks << " service checks\n";
    return 0;
}