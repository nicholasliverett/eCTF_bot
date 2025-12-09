FROM node:20-alpine

# Update system packages to fix vulnerabilities and install security patches
RUN apk update && \
    apk upgrade --no-cache -a && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (better-sqlite3 needs build tools)
RUN npm ci --omit=dev

# Copy application files
COPY --chown=node:node . .

# Create data directory for database
RUN mkdir -p /app/data && \
    chown -R node:node /app/data

# Switch to non-root user (node user comes with official Node images)
USER node

# Start the bot using dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]

