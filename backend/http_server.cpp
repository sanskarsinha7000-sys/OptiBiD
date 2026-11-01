#include "../auction_service.hpp"
#include "httplib.h"

#include <nlohmann/json.hpp>

#include <algorithm>
#include <atomic>
#include <chrono>
#include <csignal>
#include <condition_variable>
#include <exception>
#include <iostream>
#include <mutex>
#include <set>
#include <string>
#include <thread>
#include <vector>

namespace {

using Json = nlohmann::json;
using optibid::Auction;
using optibid::AuctionService;
using optibid::Bid;
using optibid::CompareResult;
using optibid::ResultsSnapshot;
using optibid::ServiceResult;
using optibid::StrategyResult;

volatile std::sig_atomic_t shutdownRequested = 0;
std::atomic<bool> stdinShutdownRequested{false};

void requestShutdown(int) {
    shutdownRequested = 1;
}

Json successEnvelope(Json data) {
    return Json{{"success", true}, {"data", std::move(data)}};
}

Json errorEnvelope(const std::string& message) {
    return Json{{"success", false}, {"error", message}};
}

void sendJson(httplib::Response& response, int status, const Json& body) {
    response.status = status;
    response.set_content(body.dump(), "application/json; charset=utf-8");
}

void sendError(httplib::Response& response, int status, const std::string& message) {
    sendJson(response, status, errorEnvelope(message));
}

int serviceErrorStatus(const std::string& message) {
    if (message.rfind("No auction exists", 0) == 0) return 404;
    if (message.find("already exists") != std::string::npos
        || message.find("already closed") != std::string::npos
        || message.find("is closed") != std::string::npos
        || message.find("still active") != std::string::npos) {
        return 409;
    }
    return 422;
}

Json toJson(const StrategyResult& result) {
    return Json{
        {"calculated", result.calculated},
        {"hasWinner", result.hasWinner},
        {"serial", result.serial},
        {"winnerName", result.winnerName},
        {"amount", result.amount},
        {"utilityScore", result.utilityScore},
    };
}

Json toJson(const Auction& auction) {
    return Json{
        {"productName", auction.productName},
        {"description", auction.description},
        {"startingPrice", auction.startingPrice},
        {"active", auction.active},
    };
}

Json toJson(const Bid& bid, bool includeScores) {
    Json value{
        {"serial", bid.serial},
        {"bidderName", bid.bidderName},
        {"amount", bid.amount},
    };
    if (includeScores) {
        value["priceScore"] = bid.priceScore;
        value["timeScore"] = bid.timeScore;
        value["utilityScore"] = bid.utilityScore;
    }
    return value;
}

Json toJson(const std::vector<Bid>& bids, bool includeScores) {
    Json values = Json::array();
    for (const Bid& bid : bids) values.push_back(toJson(bid, includeScores));
    return values;
}

Json toJson(const CompareResult& comparison) {
    return Json{
        {"priceWinner", toJson(comparison.priceWinner)},
        {"utilityWinner", toJson(comparison.utilityWinner)},
        {"bids", toJson(comparison.bids, true)},
        {"explanation", comparison.explanation},
    };
}

Json toJson(const ResultsSnapshot& results) {
    return Json{
        {"auction", results.auction ? toJson(*results.auction) : Json(nullptr)},
        {"priceResult", toJson(results.priceResult)},
        {"utilityResult", toJson(results.utilityResult)},
        {"strategiesCalculated", results.strategiesCalculated},
        {"bids", toJson(results.bids, results.utilityResult.calculated)},
    };
}

bool parseJsonObject(const httplib::Request& request,
                     httplib::Response& response,
                     Json& body) {
    if (request.body.empty()) {
        sendError(response, 400, "Request body must be a JSON object.");
        return false;
    }

    try {
        body = Json::parse(request.body);
    } catch (const Json::parse_error&) {
        sendError(response, 400, "Malformed JSON request body.");
        return false;
    }

    if (!body.is_object()) {
        sendError(response, 400, "Request body must be a JSON object.");
        return false;
    }
    return true;
}

bool requireString(const Json& body,
                   const char* field,
                   httplib::Response& response,
                   bool optional = false) {
    const auto value = body.find(field);
    if (value == body.end()) {
        if (optional) return true;
        sendError(response, 400, std::string("Missing required field: ") + field);
        return false;
    }
    if (!value->is_string()) {
        sendError(response, 400, std::string("Field must be a string: ") + field);
        return false;
    }
    return true;
}

bool requireNumber(const Json& body, const char* field, httplib::Response& response) {
    const auto value = body.find(field);
    if (value == body.end()) {
        sendError(response, 400, std::string("Missing required field: ") + field);
        return false;
    }
    if (!value->is_number()) {
        sendError(response, 400, std::string("Field must be a number: ") + field);
        return false;
    }
    return true;
}

bool isAllowedOrigin(const std::string& origin,
                     const std::set<std::string>& allowedOrigins) {
    return allowedOrigins.find(origin) != allowedOrigins.end();
}

void addCorsHeaders(httplib::Response& response, const std::string& origin) {
    response.set_header("Access-Control-Allow-Origin", origin);
    response.set_header("Vary", "Origin");
    response.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.set_header("Access-Control-Allow-Headers", "Content-Type");
    response.set_header("Access-Control-Max-Age", "600");
}

template <typename T, typename Serializer>
void sendServiceResult(httplib::Response& response,
                       const ServiceResult<T>& result,
                       Serializer serializer) {
    if (!result.success) {
        sendError(response, serviceErrorStatus(result.error), result.error);
        return;
    }
    sendJson(response, 200, successEnvelope(serializer(result.data)));
}

bool parsePort(const std::string& text, int& port) {
    try {
        std::size_t parsed = 0;
        const int value = std::stoi(text, &parsed);
        if (parsed != text.size() || value < 1 || value > 65535) return false;
        port = value;
        return true;
    } catch (...) {
        return false;
    }
}

bool parseArguments(int argc,
                    char** argv,
                    std::string& host,
                    int& port,
                    std::set<std::string>& allowedOrigins,
                    bool& shutdownOnStdinEof) {
    host = "127.0.0.1";
    port = 8080;
    allowedOrigins = {"http://127.0.0.1:5173", "http://localhost:5173"};
    shutdownOnStdinEof = false;

    for (int index = 1; index < argc; ++index) {
        const std::string option = argv[index];
        if (option == "--help" || option == "-h") {
            std::cout << "Usage: optibid_server.exe [--host ADDRESS] [--port PORT] [--cors-origin ORIGIN] [--shutdown-on-stdin-eof]\n";
            return false;
        }
        if (option == "--shutdown-on-stdin-eof") {
            shutdownOnStdinEof = true;
            continue;
        }
        if ((option == "--host" || option == "--port" || option == "--cors-origin")
            && index + 1 >= argc) {
            std::cerr << "Missing value for " << option << "\n";
            return false;
        }
        if (option == "--host") {
            host = argv[++index];
        } else if (option == "--port") {
            if (!parsePort(argv[++index], port)) {
                std::cerr << "Invalid port. Expected an integer from 1 to 65535.\n";
                return false;
            }
        } else if (option == "--cors-origin") {
            allowedOrigins.insert(argv[++index]);
        } else {
            std::cerr << "Unknown option: " << option << "\n";
            return false;
        }
    }
    return true;
}

} // namespace

int main(int argc, char** argv) {
    std::string host;
    int port = 0;
    bool shutdownOnStdinEof = false;
    std::set<std::string> allowedOrigins;
    if (!parseArguments(argc, argv, host, port, allowedOrigins, shutdownOnStdinEof)) {
        return argc > 1 && (std::string(argv[1]) == "--help" || std::string(argv[1]) == "-h")
            ? 0 : 2;
    }

    AuctionService auctionService;
    std::mutex auctionMutex;
    httplib::Server server;
    server.set_payload_max_length(64 * 1024);

    server.set_pre_routing_handler([&allowedOrigins](const httplib::Request& request,
                                                      httplib::Response& response) {
        const std::string origin = request.get_header_value("Origin");
        const bool allowed = !origin.empty() && isAllowedOrigin(origin, allowedOrigins);
        if (allowed) addCorsHeaders(response, origin);

        if (request.method == "OPTIONS" && request.path.rfind("/api/", 0) == 0) {
            if (!allowed) {
                sendError(response, 403, "Origin is not allowed for CORS.");
                return httplib::Server::HandlerResponse::Handled;
            }
            response.status = 204;
            return httplib::Server::HandlerResponse::Handled;
        }
        return httplib::Server::HandlerResponse::Unhandled;
    });

    server.set_error_handler([](const httplib::Request&, httplib::Response& response) {
        if (response.status == 404) {
            sendError(response, 404, "Unknown endpoint.");
        } else {
            sendError(response, response.status, "HTTP request failed.");
        }
    });

    server.set_exception_handler([](const httplib::Request&,
                                    httplib::Response& response,
                                    std::exception_ptr exception) {
        if (exception) {
            try {
                std::rethrow_exception(exception);
            } catch (const std::exception& error) {
                std::cerr << "Unhandled request exception: " << error.what() << '\n';
            } catch (...) {
                std::cerr << "Unhandled non-standard request exception.\n";
            }
        }
        sendError(response, 500, "Internal server error.");
    });

    server.Get("/api/auction", [&auctionService, &auctionMutex](const httplib::Request&,
                                                                 httplib::Response& response) {
        std::lock_guard<std::mutex> lock(auctionMutex);
        const auto result = auctionService.getAuction();
        if (!result.success) {
            sendError(response, serviceErrorStatus(result.error), result.error);
            return;
        }
        const Json data = result.data ? toJson(*result.data) : Json(nullptr);
        sendJson(response, 200, successEnvelope(data));
    });

    server.Post("/api/auction", [&auctionService, &auctionMutex](const httplib::Request& request,
                                                                  httplib::Response& response) {
        Json body;
        if (!parseJsonObject(request, response, body)) return;
        if (!requireString(body, "productName", response)
            || !requireNumber(body, "startingPrice", response)
            || !requireString(body, "description", response, true)) {
            return;
        }
        if (body.contains("replaceExisting") && !body["replaceExisting"].is_boolean()) {
            sendError(response, 400, "Field must be a boolean: replaceExisting");
            return;
        }

        const std::string description = body.contains("description")
            ? body["description"].get<std::string>() : std::string{};
        const bool replaceExisting = body.value("replaceExisting", false);
        std::lock_guard<std::mutex> lock(auctionMutex);
        const auto result = auctionService.createAuction({
            body["productName"].get<std::string>(),
            description,
            body["startingPrice"].get<double>(),
            replaceExisting,
        });
        sendServiceResult(response, result, [](const Auction& auction) { return toJson(auction); });
    });

    server.Get("/api/bids", [&auctionService, &auctionMutex](const httplib::Request&,
                                                              httplib::Response& response) {
        std::lock_guard<std::mutex> lock(auctionMutex);
        const auto result = auctionService.getBids();
        const auto results = auctionService.getResults();
        if (!result.success) {
            sendError(response, serviceErrorStatus(result.error), result.error);
            return;
        }
        const bool includeScores = results.success
            && results.data.utilityResult.calculated;
        sendJson(response, 200, successEnvelope(toJson(result.data, includeScores)));
    });

    server.Post("/api/bids", [&auctionService, &auctionMutex](const httplib::Request& request,
                                                               httplib::Response& response) {
        Json body;
        if (!parseJsonObject(request, response, body)) return;
        if (!requireString(body, "bidderName", response)
            || !requireNumber(body, "amount", response)) {
            return;
        }

        std::lock_guard<std::mutex> lock(auctionMutex);
        const auto result = auctionService.placeBid({
            body["bidderName"].get<std::string>(),
            body["amount"].get<double>(),
        });
        sendServiceResult(response, result, [](const Bid& bid) { return toJson(bid, false); });
    });

    server.Post("/api/auction/close", [&auctionService, &auctionMutex](const httplib::Request&,
                                                                        httplib::Response& response) {
        std::lock_guard<std::mutex> lock(auctionMutex);
        const auto result = auctionService.closeAuction();
        sendServiceResult(response, result, [](const Auction& auction) { return toJson(auction); });
    });

    server.Post("/api/strategy/price", [&auctionService, &auctionMutex](const httplib::Request&,
                                                                         httplib::Response& response) {
        std::lock_guard<std::mutex> lock(auctionMutex);
        const auto result = auctionService.calculateHighestPriceStrategy();
        sendServiceResult(response, result, [](const StrategyResult& value) { return toJson(value); });
    });

    server.Post("/api/strategy/utility", [&auctionService, &auctionMutex](const httplib::Request&,
                                                                           httplib::Response& response) {
        std::lock_guard<std::mutex> lock(auctionMutex);
        const auto result = auctionService.calculateUtilityGreedyStrategy();
        sendServiceResult(response, result, [](const StrategyResult& value) { return toJson(value); });
    });

    server.Post("/api/strategy/compare", [&auctionService, &auctionMutex](const httplib::Request&,
                                                                           httplib::Response& response) {
        std::lock_guard<std::mutex> lock(auctionMutex);
        const auto result = auctionService.compareStrategies();
        sendServiceResult(response, result, [](const CompareResult& value) { return toJson(value); });
    });

    server.Get("/api/results", [&auctionService, &auctionMutex](const httplib::Request&,
                                                                 httplib::Response& response) {
        std::lock_guard<std::mutex> lock(auctionMutex);
        const auto result = auctionService.getResults();
        sendServiceResult(response, result, [](const ResultsSnapshot& value) { return toJson(value); });
    });

    if (!server.is_valid()) {
        std::cerr << "HTTP server initialization failed.\n";
        return 1;
    }
    if (!server.bind_to_port(host, port)) {
        std::cerr << "Unable to bind OptiBiD API server to " << host << ':' << port << ".\n";
        return 1;
    }

    std::signal(SIGINT, requestShutdown);
#ifdef SIGTERM
    std::signal(SIGTERM, requestShutdown);
#endif

    std::mutex listenerMutex;
    std::condition_variable listenerCondition;
    bool listenerFinished = false;
    bool listenSucceeded = false;
    std::thread listener([&]() {
        const bool result = server.listen_after_bind();
        {
            std::lock_guard<std::mutex> lock(listenerMutex);
            listenSucceeded = result;
            listenerFinished = true;
        }
        listenerCondition.notify_one();
    });

    std::cout << "OptiBiD API listening on http://" << host << ':' << port << '\n';
    std::cout << "Allowed Vite origins:";
    for (const std::string& origin : allowedOrigins) std::cout << ' ' << origin;
    std::cout << "\nPress Ctrl+C to stop.\n" << std::flush;

    if (shutdownOnStdinEof) {
        std::thread([]() {
            std::string command;
            while (std::getline(std::cin, command)) {
                if (command == "shutdown") {
                    stdinShutdownRequested.store(true);
                    return;
                }
            }
            stdinShutdownRequested.store(true);
        }).detach();
    }

    {
        std::unique_lock<std::mutex> lock(listenerMutex);
        while (!listenerFinished && shutdownRequested == 0
            && !stdinShutdownRequested.load()) {
            listenerCondition.wait_for(lock, std::chrono::milliseconds(100));
        }
    }

    server.stop();
    listener.join();
    if (shutdownRequested != 0 || stdinShutdownRequested.load()) {
        std::cout << "OptiBiD API stopped cleanly.\n";
        return 0;
    }
    if (!listenSucceeded) {
        std::cerr << "OptiBiD API listener stopped unexpectedly.\n";
        return 1;
    }
    return 0;
}