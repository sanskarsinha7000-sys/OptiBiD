import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const host = "127.0.0.1";
const port = Number(process.env.OPTIBID_TEST_PORT || 8080);
const origin = "http://localhost:5173";
const executable = fileURLToPath(new URL("../backend/optibid_server.exe", import.meta.url));
const baseUrl = `http://${host}:${port}`;
const server = spawn(executable, ["--host", host, "--port", String(port), "--shutdown-on-stdin-eof"], {
  stdio: ["pipe", "pipe", "pipe"],
});

let serverOutput = "";
let serverError = "";
let checkCount = 0;
server.stdout.setEncoding("utf8");
server.stderr.setEncoding("utf8");
server.stdout.on("data", (chunk) => { serverOutput += chunk; });
server.stderr.on("data", (chunk) => { serverError += chunk; });
const exitPromise = new Promise((resolve) => {
  server.once("exit", (code, signal) => resolve({ code, signal }));
});

function verify(condition, message) {
  checkCount += 1;
  assert.ok(condition, message);
}

async function request(pathname, { method = "GET", body, headers = {} } = {}) {
  const requestHeaders = { ...headers };
  let requestBody;
  if (body !== undefined) {
    requestHeaders["Content-Type"] = requestHeaders["Content-Type"] || "application/json";
    requestBody = typeof body === "string" ? body : JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: requestHeaders,
    body: requestBody,
    signal: AbortSignal.timeout(3000),
  });
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${method} ${pathname} returned non-JSON: ${text.slice(0, 200)}`);
  }
  return { response, json };
}

async function waitUntilReady() {
  const readyLine = `OptiBiD API listening on http://${host}:${port}`;
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Server exited before startup. stderr: ${serverError}`);
    }
    if (serverOutput.includes(readyLine)) return;
    await delay(50);
  }
  throw new Error(`Timed out waiting for server startup. stdout: ${serverOutput}; stderr: ${serverError}`);
}

async function stopServer() {
  if (server.exitCode !== null) return { code: server.exitCode, signal: null };
  server.stdin.end();
  const exit = await Promise.race([
    exitPromise,
    delay(4000).then(() => null),
  ]);
  if (exit) return exit;
  server.kill();
  return Promise.race([exitPromise, delay(1000).then(() => null)]);
}

let successful = false;
try {
  await waitUntilReady();
  verify(serverOutput.includes(readyLineFor(host, port)), "server starts on the requested port");

  let result = await request("/api/auction");
  verify(result.response.status === 200, "initial auction GET returns 200");
  verify(result.json.success === true && result.json.data === null, "initial auction is null in success envelope");

  result = await request("/api/bids");
  verify(result.response.status === 200 && Array.isArray(result.json.data), "initial bids GET returns an array");
  verify(result.json.data.length === 0, "initial bid list is empty");

  result = await request("/api/auction", {
    method: "POST",
    body: { productName: "Integration Lot", description: "Test item", startingPrice: 50 },
  });
  verify(result.response.status === 200 && result.json.success, "auction creation succeeds");
  verify(result.json.data.productName === "Integration Lot", "created auction has expected product");
  verify(result.json.data.active === true, "new auction is active");
  verify(!Object.hasOwn(result.json.data, "createdAt"), "server does not invent an auction timestamp");

  result = await request("/api/auction");
  verify(result.json.data.productName === "Integration Lot", "GET returns the created auction");

  result = await request("/api/auction", {
    method: "POST",
    body: { productName: "Replacement Lot", startingPrice: 20 },
  });
  verify(result.response.status === 409 && result.json.success === false,
    "implicit second auction is rejected by service replacement policy");
  verify(typeof result.json.error === "string", "replacement error has structured message");

  const bidsToPlace = [
    { bidderName: "Early Bidder", amount: 100 },
    { bidderName: "Middle Bidder", amount: 110 },
    { bidderName: "Late Bidder", amount: 125 },
  ];
  const acceptedBids = [];
  for (const [index, bid] of bidsToPlace.entries()) {
    result = await request("/api/bids", { method: "POST", body: bid });
    verify(result.response.status === 200 && result.json.success, `valid bid ${index + 1} succeeds`);
    verify(result.json.data.serial === index + 1, `valid bid ${index + 1} gets sequential serial`);
    verify(!Object.hasOwn(result.json.data, "createdAt"), "server does not invent a bid timestamp");
    acceptedBids.push(result.json.data);
  }

  result = await request("/api/bids", {
    method: "POST",
    body: { bidderName: "Invalid Amount", amount: 50 },
  });
  verify(result.response.status === 422 && result.json.success === false,
    "invalid bid amount returns 422 failure envelope");
  verify(typeof result.json.error === "string", "invalid bid error has a message");

  result = await request("/api/bids", {
    method: "POST",
    body: { bidderName: "   ", amount: 60 },
  });
  verify(result.response.status === 422 && result.json.success === false,
    "blank bidder name returns structured validation error");

  result = await request("/api/bids");
  verify(result.response.status === 200 && result.json.data.length === 3,
    "GET bids returns all accepted bids");
  verify(result.json.data[1].bidderName === acceptedBids[1].bidderName,
    "GET bids preserves service bid fields");

  result = await request("/api/strategy/price", { method: "POST" });
  verify(result.response.status === 409 && result.json.success === false,
    "price strategy is rejected while auction is active");
  result = await request("/api/strategy/utility", { method: "POST" });
  verify(result.response.status === 409 && result.json.success === false,
    "utility strategy is rejected while auction is active");

  result = await request("/api/bids", {
    method: "POST",
    body: "{ malformed json",
  });
  verify(result.response.status === 400 && result.json.success === false,
    "malformed JSON returns 400 structured error");
  verify(typeof result.json.error === "string", "malformed JSON error is JSON");

  result = await request("/api/auction", {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });
  verify(result.response.status === 204, "allowed CORS preflight returns 204");
  verify(result.response.headers.get("access-control-allow-origin") === origin,
    "CORS allows the exact Vite origin");
  verify(result.response.headers.get("access-control-allow-methods").includes("POST"),
    "CORS lists POST");

  result = await request("/api/auction", {
    method: "OPTIONS",
    headers: {
      Origin: "https://untrusted.invalid",
      "Access-Control-Request-Method": "POST",
    },
  });
  verify(result.response.status === 403 && result.json.success === false,
    "unlisted CORS origin is rejected");

  result = await request("/api/auction/close", { method: "POST" });
  verify(result.response.status === 200 && result.json.data.active === false,
    "close endpoint changes auction to inactive");

  result = await request("/api/auction");
  verify(result.json.data.active === false, "closed state is visible through auction GET");

  result = await request("/api/bids", {
    method: "POST",
    body: { bidderName: "Too Late", amount: 200 },
  });
  verify(result.response.status === 409 && result.json.success === false,
    "closed auction rejects new bids");

  result = await request("/api/strategy/price", { method: "POST" });
  verify(result.response.status === 200 && result.json.data.hasWinner,
    "price strategy endpoint succeeds after close");
  verify(result.json.data.serial === 3 && result.json.data.amount === 125,
    "price strategy returns the service-selected highest bid");

  result = await request("/api/strategy/utility", { method: "POST" });
  verify(result.response.status === 200 && result.json.data.hasWinner,
    "utility strategy endpoint succeeds after close");
  verify(result.json.data.serial === 1, "utility winner follows C++ score formula");

  result = await request("/api/strategy/compare", { method: "POST" });
  verify(result.response.status === 200 && result.json.success, "compare endpoint succeeds");
  verify(result.json.data.priceWinner.serial === 3, "comparison includes price winner");
  verify(result.json.data.utilityWinner.serial === 1, "comparison includes utility winner");
  verify(result.json.data.bids.length === 3, "comparison returns all scored bids");
  verify(result.json.data.bids[0].utilityScore > 0, "comparison returns score fields");
  verify(typeof result.json.data.explanation === "string", "comparison returns explanation");

  result = await request("/api/bids");
  verify(result.json.data[0].priceScore > 0 && result.json.data[0].utilityScore > 0,
    "GET bids includes persisted C++ scores after utility calculation");

  result = await request("/api/results");
  verify(result.response.status === 200 && result.json.success, "results endpoint succeeds");
  verify(result.json.data.auction.active === false, "results include closed auction");
  verify(result.json.data.strategiesCalculated === true, "results show calculated strategies");
  verify(result.json.data.priceResult.serial === 3, "results include price result");
  verify(result.json.data.utilityResult.serial === 1, "results include utility result");

  result = await request("/api/auction", {
    method: "POST",
    body: { productName: "Replacement Lot", startingPrice: 20 },
  });
  verify(result.response.status === 409, "replacement remains rejected without explicit flag");

  result = await request("/api/auction", {
    method: "POST",
    body: { productName: "Replacement Lot", startingPrice: 20, replaceExisting: true },
  });
  verify(result.response.status === 200 && result.json.data.productName === "Replacement Lot",
    "explicit replacement follows AuctionService policy");
  verify(result.json.data.active === true, "replacement auction is active");

  result = await request("/api/bids");
  verify(result.json.data.length === 0, "replacement clears old bids");

  result = await request("/api/auction/close", { method: "POST" });
  verify(result.response.status === 200, "empty-bid auction can be closed");
  result = await request("/api/strategy/price", { method: "POST" });
  verify(result.response.status === 200 && result.json.data.calculated && !result.json.data.hasWinner,
    "zero-bid price strategy matches service semantics");
  result = await request("/api/strategy/utility", { method: "POST" });
  verify(result.response.status === 200 && result.json.data.calculated && !result.json.data.hasWinner,
    "zero-bid utility strategy matches service semantics");
  result = await request("/api/strategy/compare", { method: "POST" });
  verify(result.response.status === 200 && result.json.data.priceWinner.calculated,
    "zero-bid comparison remains a successful calculated result");

  result = await request("/api/results");
  verify(result.json.data.bids.length === 0 && result.json.data.strategiesCalculated,
    "zero-bid results are available and marked calculated");

  result = await request("/api/not-a-route");
  verify(result.response.status === 404 && result.json.success === false,
    "unknown route returns structured JSON 404");

  result = await request("/api/auction");
  verify(result.response.status === 200 && result.json.data.productName === "Replacement Lot",
    "server remains alive after malformed JSON and other failures");
  successful = true;
} finally {
  const exit = await stopServer();
  if (!exit) {
    throw new Error(`Server did not stop after SIGINT. stdout: ${serverOutput}; stderr: ${serverError}`);
  }
  if (successful) {
    verify(exit.code === 0, `server exits cleanly after stdin shutdown (code=${exit.code}, signal=${exit.signal})`);
    verify(serverOutput.includes("OptiBiD API stopped cleanly."), "server reports clean shutdown");
    console.log(`PASS: ${checkCount} HTTP integration checks`);
  }
}

function readyLineFor(serverHost, serverPort) {
  return `OptiBiD API listening on http://${serverHost}:${serverPort}`;
}