#ifndef OPTIBID_AUCTION_SERVICE_HPP
#define OPTIBID_AUCTION_SERVICE_HPP

#include <optional>
#include <string>
#include <utility>
#include <vector>

namespace optibid {

inline constexpr bool REQUIRE_HIGHER_THAN_CURRENT_HIGHEST = false;
inline constexpr double WEIGHT_PRICE = 0.7;
inline constexpr double WEIGHT_TIME = 0.3;
inline constexpr double EPSILON = 1e-9;

struct Bid {
    int serial = 0;
    std::string bidderName;
    double amount = 0.0;
    double priceScore = 0.0;
    double timeScore = 0.0;
    double utilityScore = 0.0;
};

struct StrategyResult {
    bool calculated = false;
    bool hasWinner = false;
    int serial = 0;
    std::string winnerName;
    double amount = 0.0;
    double utilityScore = 0.0;
};

struct Auction {
    std::string productName;
    std::string description;
    double startingPrice = 0.0;
    bool active = true;
    StrategyResult priceResult;
    StrategyResult utilityResult;
};

struct CreateAuctionRequest {
    std::string productName;
    std::string description;
    double startingPrice = 0.0;
    bool replaceExisting = false;
};

struct PlaceBidRequest {
    std::string bidderName;
    double amount = 0.0;
};

struct CompareResult {
    StrategyResult priceWinner;
    StrategyResult utilityWinner;
    std::vector<Bid> bids;
    std::string explanation;
};

struct ResultsSnapshot {
    std::optional<Auction> auction;
    std::vector<Bid> bids;
    StrategyResult priceResult;
    StrategyResult utilityResult;
    bool strategiesCalculated = false;
};

template <typename T>
struct ServiceResult {
    bool success = false;
    T data{};
    std::string error;

    static ServiceResult ok(T value) {
        return {true, std::move(value), {}};
    }

    static ServiceResult fail(std::string message) {
        return {false, T{}, std::move(message)};
    }
};

class AuctionService {
public:
    ServiceResult<Auction> createAuction(const CreateAuctionRequest& request);
    ServiceResult<std::optional<Auction>> getAuction() const;
    ServiceResult<std::vector<Bid>> getBids() const;
    ServiceResult<Bid> placeBid(const PlaceBidRequest& request);
    ServiceResult<Auction> closeAuction();
    ServiceResult<StrategyResult> calculateHighestPriceStrategy();
    ServiceResult<StrategyResult> calculateUtilityGreedyStrategy();
    ServiceResult<CompareResult> compareStrategies();
    ServiceResult<ResultsSnapshot> getResults() const;

private:
    std::optional<Auction> auction_;
    std::vector<Bid> bids_;

    std::string closedAuctionError() const;
};

} // namespace optibid

#endif // OPTIBID_AUCTION_SERVICE_HPP