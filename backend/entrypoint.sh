#!/bin/sh
set -eu

set -- /usr/local/bin/optibid-server --host 0.0.0.0 --port "${PORT:-8080}"

if [ -n "${FRONTEND_ORIGIN:-}" ]; then
  set -- "$@" --cors-origin "$FRONTEND_ORIGIN"
fi

exec "$@"