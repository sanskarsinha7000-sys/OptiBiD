// ============================================================================
//  SMART AUCTION SYSTEM WITH GREEDY-BASED BID OPTIMIZATION   (C++17)
//  Console prototype - one auction at a time, data stored in memory.
//
//  Bidders enter only NAME and PRICE. Each accepted bid automatically gets a
//  serial number (1, 2, 3, ...) in the order the bids were made.
//
//  Compile:  g++ -std=c++17 -Wall -Wextra -pedantic main.cpp auction_service.cpp -o auction
//  Run:      ./auction        (Windows: .\auction.exe)
// ============================================================================

#include "auction_service.hpp"

#include <algorithm>
#include <cerrno>
#include <climits>
#include <cmath>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

using namespace std;
using namespace optibid;

AuctionService auctionService;

// ---------------------------------------------------------------------------
//  INPUT HELPERS (safe against letters, empty input and end-of-input)
// ---------------------------------------------------------------------------

string trim(const string& s) {
    size_t first = s.find_first_not_of(" \t\r\n");
    if (first == string::npos) return "";
    size_t last = s.find_last_not_of(" \t\r\n");
    return s.substr(first, last - first + 1);
}

string readLine(const string& prompt) {
    cout << prompt;
    string line;
    if (!getline(cin, line)) {  // input closed -> exit instead of looping forever
        cout << "\nInput closed. Exiting program.\n";
        exit(0);
    }
    return trim(line);
}

bool parseInt(const string& text, int& out) {
    if (text.empty()) return false;
    char* end = nullptr;
    errno = 0;
    long value = strtol(text.c_str(), &end, 10);
    if (*end != '\0' || errno != 0 || value < INT_MIN || value > INT_MAX) return false;
    out = static_cast<int>(value);
    return true;
}

bool parseDouble(const string& text, double& out) {
    if (text.empty()) return false;
    char* end = nullptr;
    errno = 0;
    double value = strtod(text.c_str(), &end);
    if (*end != '\0' || errno != 0 || !isfinite(value)) return false;
    out = value;
    return true;
}

int readInt(const string& prompt) {
    while (true) {
        int value;
        if (parseInt(readLine(prompt), value)) return value;
        cout << "  Invalid input. Please enter a whole number.\n";
    }
}

double readDouble(const string& prompt) {
    while (true) {
        double value;
        if (parseDouble(readLine(prompt), value)) return value;
        cout << "  Invalid input. Please enter a number (e.g. 35000 or 99.5).\n";
    }
}

string shorten(const string& s, size_t maxLen) {
    if (s.size() <= maxLen) return s;
    return s.substr(0, maxLen - 2) + "..";
}

// ---------------------------------------------------------------------------
//  MENU FEATURES
// ---------------------------------------------------------------------------

// 1. Create Auction
void createAuction() {
    cout << "\n--- Create Auction ---\n";
    bool replaceExisting = false;
    const auto current = auctionService.getAuction();
    if (current.success && current.data.has_value()) {
        string answer = readLine("  An auction already exists. Creating a new one erases it and all its bids. Continue? (y/n): ");
        if (answer != "y" && answer != "Y") {
            cout << "  Cancelled. Existing auction kept.\n";
            return;
        }
        replaceExisting = true;
    }
    string name = readLine("Product name: ");
    string description = readLine("Product description (optional): ");
    double price = readDouble("Starting price: ");

    const auto result = auctionService.createAuction({name, description, price, replaceExisting});
    if (!result.success) {
        cout << "  Error: " << result.error << "\n";
        return;
    }

    cout << "  Auction for \"" << name << "\" created successfully (Active).\n";
}

// 2. View Auction
void viewAuction() {
    cout << "\n--- Auction Details ---\n";
    const auto auctionResult = auctionService.getAuction();
    const auto bidsResult = auctionService.getBids();
    if (!auctionResult.success || !auctionResult.data.has_value()) {
        cout << "  No auction available. Create one first.\n";
        return;
    }
    const Auction& auction = *auctionResult.data;
    cout << "Product        : " << auction.productName << "\n";
    cout << "Description    : " << auction.description << "\n";
    cout << "Starting price : " << auction.startingPrice << "\n";
    cout << "Number of bids : " << bidsResult.data.size() << "\n";
    cout << "Status         : " << (auction.active ? "Active" : "Closed") << "\n";
}

// 3. Place a Bid - only NAME and PRICE are asked.
// The serial number is given automatically in the order of bidding.
void placeBid() {
    cout << "\n--- Place a Bid ---\n";
    const auto auctionResult = auctionService.getAuction();
    if (!auctionResult.success || !auctionResult.data.has_value()) {
        cout << "  No auction exists yet. Create one first (option 1).\n";
        return;
    }
    if (!auctionResult.data->active) {
        cout << "  Error: Auction is Closed. No new bids accepted.\n";
        return;
    }

    string bidder = readLine("Bidder name: ");
    double amount = readDouble("Bid price: ");
    const auto result = auctionService.placeBid({bidder, amount});
    if (!result.success) {
        cout << "  Error: " << result.error << "\n";
        return;
    }

    cout << "  Bid accepted! " << result.data.bidderName
         << " is bidder serial no. " << result.data.serial << "\n";
}

// 4. View Bids
void viewBids() {
    cout << "\n--- Bid History ---\n";
    const auto auctionResult = auctionService.getAuction();
    const auto bidsResult = auctionService.getBids();
    if (!auctionResult.success || !auctionResult.data.has_value()) {
        cout << "  No auction exists yet.\n";
        return;
    }
    cout << "Auction: " << auctionResult.data->productName << "\n";
    if (bidsResult.data.empty()) {
        cout << "  No bids placed yet.\n";
        return;
    }
    cout << left << setw(10) << "Serial" << setw(20) << "Bidder" << setw(14) << "Bid Price" << "\n";
    cout << string(44, '-') << "\n";
    for (const Bid& b : bidsResult.data) {
        cout << left << setw(10) << b.serial << setw(20) << shorten(b.bidderName, 18)
             << setw(14) << b.amount << "\n";
    }
}

// 5. Highest-Price Strategy
void runPriceStrategy() {
    cout << "\n--- Highest-Price Strategy ---\n";
    const auto result = auctionService.calculateHighestPriceStrategy();
    if (!result.success) {
        cout << "  Error: " << result.error << "\n";
        return;
    }
    if (!result.data.hasWinner) {
        cout << "  No winner: no valid bids found.\n";
        return;
    }
    cout << "  Highest-Price Winner: " << result.data.winnerName
         << " (serial " << result.data.serial << ")\n";
    cout << "  Winning Bid: " << result.data.amount << "\n";
}

// 6. Utility-Based Greedy Strategy
void runUtilityStrategy() {
    cout << "\n--- Utility-Based Greedy Strategy ---\n";
    const auto result = auctionService.calculateUtilityGreedyStrategy();
    if (!result.success) {
        cout << "  Error: " << result.error << "\n";
        return;
    }
    if (!result.data.hasWinner) {
        cout << "  No winner: no valid bids found.\n";
        return;
    }
    cout << "  Utility-Based Winner: " << result.data.winnerName
         << " (serial " << result.data.serial << ")\n";
    cout << "  Winning Bid: " << result.data.amount << "\n";
    cout << "  Utility Score: " << result.data.utilityScore << "\n";
}

// 7. Compare Both Strategies
void compareStrategies() {
    cout << "\n--- Compare Both Strategies ---\n";
    const auto result = auctionService.compareStrategies();
    if (!result.success) {
        cout << "  Error: " << result.error << "\n";
        return;
    }
    if (!result.data.priceWinner.hasWinner || !result.data.utilityWinner.hasWinner) {
        cout << "  No winner: no valid bids found.\n";
        return;
    }

    cout << "\nAuction: " << auctionService.getAuction().data->productName << "\n\n";
    cout << left << setw(8) << "Serial" << setw(16) << "Bidder" << setw(13) << "Bid Price"
         << setw(13) << "Price Score" << setw(12) << "Time Score" << setw(8) << "Utility" << "\n";
    cout << string(70, '-') << "\n";
    for (const Bid& b : result.data.bids) {
        cout << left << setw(8) << b.serial << setw(16) << shorten(b.bidderName, 14)
             << setw(13) << b.amount << setw(13) << b.priceScore << setw(12) << b.timeScore
             << setw(8) << b.utilityScore << "\n";
    }

    cout << "\nHighest-Price Winner: " << result.data.priceWinner.winnerName << "\n";
    cout << "Winning Bid: " << result.data.priceWinner.amount << "\n";
    cout << "\nUtility-Based Winner: " << result.data.utilityWinner.winnerName << "\n";
    cout << "Winning Bid: " << result.data.utilityWinner.amount << "\n";
    cout << "Utility Score: " << result.data.utilityWinner.utilityScore << "\n\n";
    cout << "Explanation: " << result.data.explanation << "\n";
}

// 8. View Results
void viewResults() {
    cout << "\n--- Auction Results ---\n";
    const auto result = auctionService.getResults();
    if (!result.success || !result.data.auction.has_value()) {
        cout << "  No auction exists yet.\n";
        return;
    }
    const Auction& auction = *result.data.auction;
    cout << "Product: " << auction.productName << "\n";
    cout << "Status : " << (auction.active ? "Active" : "Closed") << "\n\n";

    cout << "Highest-Price Result:\n";
    if (!auction.priceResult.calculated) {
        cout << "  Result not calculated yet.\n";
    } else if (!auction.priceResult.hasWinner) {
        cout << "  No winner: no valid bids found.\n";
    } else {
        cout << "  Winner: " << auction.priceResult.winnerName << "\n";
        cout << "  Winning Bid: " << auction.priceResult.amount << "\n";
    }

    cout << "\nUtility-Based Greedy Result:\n";
    if (!auction.utilityResult.calculated) {
        cout << "  Result not calculated yet.\n";
    } else if (!auction.utilityResult.hasWinner) {
        cout << "  No winner: no valid bids found.\n";
    } else {
        cout << "  Winner: " << auction.utilityResult.winnerName << "\n";
        cout << "  Winning Bid: " << auction.utilityResult.amount << "\n";
        cout << "  Winning Utility Score: " << auction.utilityResult.utilityScore << "\n";
    }
}

// 9. Close Auction
void closeAuction() {
    cout << "\n--- Close Auction ---\n";
    const auto result = auctionService.closeAuction();
    if (!result.success) {
        cout << "  " << result.error << "\n";
        return;
    }
    cout << "  Auction for \"" << result.data.productName
         << "\" is now Closed. No more bids accepted.\n";
}

void showMenu() {
    cout << "\n========== SMART AUCTION SYSTEM ==========\n\n"
         << "1. Create Auction\n"
         << "2. View Auction\n"
         << "3. Place a Bid\n"
         << "4. View Bids\n"
         << "5. Run Highest-Price Strategy\n"
         << "6. Run Utility-Based Greedy Strategy\n"
         << "7. Compare Both Strategies\n"
         << "8. View Auction Results\n"
         << "9. Close Auction\n"
         << "0. Exit\n\n";
}

int main() {
    cout << fixed << setprecision(2);

    int choice = -1;
    while (choice != 0) {
        showMenu();
        choice = readInt("Enter your choice: ");
        switch (choice) {
            case 1: createAuction(); break;
            case 2: viewAuction(); break;
            case 3: placeBid(); break;
            case 4: viewBids(); break;
            case 5: runPriceStrategy(); break;
            case 6: runUtilityStrategy(); break;
            case 7: compareStrategies(); break;
            case 8: viewResults(); break;
            case 9: closeAuction(); break;
            case 0: cout << "\nThank you for using the Smart Auction System. Goodbye!\n"; break;
            default: cout << "  Invalid choice. Please enter a number from 0 to 9.\n";
        }
    }
    return 0;
}
