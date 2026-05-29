#!/usr/bin/env bash
# Use project-local Node when system npm is not installed
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$ROOT/.node/bin:$PATH"
exec npm "$@"
