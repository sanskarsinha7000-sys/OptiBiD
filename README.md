# OptiBiD

OptiBiD is a React/Vite auction frontend with a C++17 in-memory auction API.
The C++ console program remains available separately as `main.cpp`.

## Local Development

1. Install frontend dependencies with `npm ci` in `frontend/`.
2. Install the C++ JSON dependency in an MSYS2 UCRT64 shell:

   ```sh
   pacman -S --needed mingw-w64-ucrt-x86_64-nlohmann-json
   ```

3. Build the API from the workspace root:

   ```sh
   g++ -std=c++17 -Wall -Wextra -pedantic -pthread \
     -Ivendor/cpp-httplib \
     auction_service.cpp backend/http_server.cpp \
     -lws2_32 -o backend/optibid_server.exe
   ```

4. Start `backend/optibid_server.exe` from the workspace root.
5. Copy `frontend/.env.example` to `frontend/.env.local` for local real-API mode.
   The `.env.local` file is ignored by Git.
6. Start the frontend with `npm run dev -- --host 127.0.0.1` from `frontend/`.

The API listens on `127.0.0.1:8080` by default. See [backend/README.md](backend/README.md)
for the endpoint contract and integration test instructions.

## Deployment

The frontend and C++ API deploy as separate services:

- **API:** Create a Render Blueprint from the repository root using `render.yaml`.
  The Docker build uses the existing `AuctionService`, and Render supplies the
  listening `PORT`. After the frontend is deployed, set the API service's
  `FRONTEND_ORIGIN` to the exact Vercel production origin (for example,
  `https://your-project.vercel.app`) and redeploy.
- **Frontend:** Import the repository into Vercel and set the project root to
  `frontend/`. Use `npm run build` and `dist` as the output directory. Set
  `VITE_API_BASE_URL` to the Render service URL followed by `/api`, and set
  `VITE_MOCK_MODE` to `false`; these values are embedded at build time.

The public Vercel and Render URLs are assigned by those providers after account
authorization and deployment. The API stores data in memory, so auctions reset
when its process restarts or sleeps.