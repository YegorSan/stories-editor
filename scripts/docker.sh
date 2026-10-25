#!/usr/bin/env bash
# Prefer WSL docker; fall back to Docker Desktop's Windows CLI.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  exec docker "$@"
fi

WIN_DOCKER="/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"
if [[ -x "$WIN_DOCKER" ]]; then
  exec "$WIN_DOCKER" "$@"
fi

echo "Docker not available. Start Docker Desktop and enable WSL integration." >&2
exit 1
