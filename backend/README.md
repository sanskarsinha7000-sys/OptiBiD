# OptiBiD HTTP Backend

This process adapts the existing in-memory `AuctionService` to the React
frontend's JSON API. It is separate from the console program in `main.cpp`;
the HTTP server keeps one service instance alive for its entire process.

## Dependencies

- C++17 compiler. The verified environment is MSYS2 UCRT64 `g++ 15.2.0`.
- `nlohmann/json` 3.12.0, installed from the MSYS2 UCRT64 repository:

  ```sh
  pacman -S --needed mingw-w64-ucrt-x86_64-nlohmann-json
  ```

- `cpp-httplib` 0.18.7 is vendored at `vendor/cpp-httplib/httplib.h` with its
  MIT license. Header SHA-256:
  `4770f8ea3d3fcd27b0b713c783d9b53bce3baddbd5adad13714011df96142526`.

No database, OpenSSL, or additional HTTP library package is required for this
HTTP-only server build.

## Build and Run

From the workspace root in an MSYS2 UCRT64 shell:

```sh
g++ -std=c++17 -Wall -Wextra -pedantic -pthread \
  -Ivendor/cpp-httplib \
  auction_service.cpp backend/http_server.cpp \
  -lws2_32 -o backend/optibid_server.exe
./backend/optibid_server.exe
```

The default listener is `127.0.0.1:8080`. Optional arguments:

```sh
./backend/optibid_server.exe --host 127.0.0.1 --port 8080 \
  --cors-origin http://localhost:5174
```

The server allows `http://localhost:5173` and `http://127.0.0.1:5173` by
default. Additional origins must be explicitly supplied with `--cors-origin`;
wildcard CORS is not enabled. Press Ctrl+C to request a clean shutdown.
The test runner uses `--shutdown-on-stdin-eof` so it can request a graceful
shutdown through a closed stdin pipe on Windows, where child-process SIGINT
does not reliably invoke the C++ signal handler.

## API

All success and failure bodies use `{ "success": true, "data": ... }` and
`{ "success": false, "error": "..." }` respectively. JSON request bodies
are capped at 64 KiB.

- `GET /api/auction`
- `POST /api/auction` with `productName`, `startingPrice`, optional
  `description`, and optional boolean `replaceExisting`
- `GET /api/bids`
- `POST /api/bids` with `bidderName` and `amount`
- `POST /api/auction/close`
- `POST /api/strategy/price`
- `POST /api/strategy/utility`
- `POST /api/strategy/compare`
- `GET /api/results`

Creating an auction when one already exists returns HTTP 409 unless
`replaceExisting: true` is sent. Strategy calls on a closed auction with no
bids return successful, calculated no-winner results, matching the C++ service.
No timestamps are synthesized. Comparison and results return bid scores after
the service has calculated them.

Typical status codes are 400 for malformed/mistyped request JSON, 404 when no
auction exists for an operation, 409 for conflicting auction state, 422 for
service validation failures, and 500 for unexpected server errors.

## Verification

Build the server as above, then run the integration test from the workspace
root in another terminal:

```sh
node tests/http_api_integration.mjs
```

The test starts the server on port 8080, runs requests through the full API,
and sends SIGINT to verify shutdown. Set `OPTIBID_TEST_PORT` if port 8080 is
already occupied.