#!/bin/sh
set -e

# Ensure data directory exists and has correct permissions
# This runs as root before switching to node user
if [ -d /app/data ]; then
    chown -R node:node /app/data 2>/dev/null || true
    chmod -R 755 /app/data 2>/dev/null || true
fi

# Switch to node user and execute the main command
exec su-exec node "$@"
