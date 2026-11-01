FROM debian:bookworm-slim AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ nlohmann-json3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src
COPY auction_service.hpp auction_service.cpp ./
COPY backend/http_server.cpp backend/
COPY vendor/cpp-httplib/httplib.h vendor/cpp-httplib/

RUN g++ -std=c++17 -Wall -Wextra -pedantic -pthread \
    -Ivendor/cpp-httplib \
    auction_service.cpp backend/http_server.cpp \
    -o /optibid-server

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /optibid-server /usr/local/bin/optibid-server
COPY backend/entrypoint.sh /entrypoint.sh

EXPOSE 8080
CMD ["/bin/sh", "/entrypoint.sh"]