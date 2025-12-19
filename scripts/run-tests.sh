#!/usr/bin/env bash
set -euo pipefail

if [ -n "${CI:-}" ]; then
    exec vitest run "$@"
else
    export GDK_BACKEND=x11
    export GSK_RENDERER=cairo
    export LIBGL_ALWAYS_SOFTWARE=1
    exec xvfb-run -a vitest run "$@"
fi
