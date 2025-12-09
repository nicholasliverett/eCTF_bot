# Build stage - compile native modules
FROM node:lts-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (native modules will be compiled here)
RUN npm ci --omit=dev

# Runtime stage - minimal image
FROM node:lts-alpine

# Update system packages and install only runtime dependencies
RUN apk update && \
    apk upgrade --no-cache -a && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

WORKDIR /app

# Copy node_modules from builder (includes compiled native modules)
COPY --from=builder /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy application files
COPY --chown=node:node . .

# Create data directory for database
RUN mkdir -p /app/data && \
    chown -R node:node /app/data

# Switch to non-root user
USER node

# Start the bot using dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]

