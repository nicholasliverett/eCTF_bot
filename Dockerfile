FROM node:20-alpine

# Update system packages to fix vulnerabilities and install security patches
RUN apk update && \
    apk upgrade --no-cache -a && \
    apk add --no-cache dumb-init su-exec && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (better-sqlite3 needs build tools)
RUN npm ci --omit=dev

# Copy application files
COPY --chown=node:node . .

# Copy and set up entrypoint script (as root to allow chown)
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create data directory for database
RUN mkdir -p /app/data && \
    chown -R node:node /app/data

# Keep as root user - entrypoint will switch to node after fixing permissions
# Start the bot using dumb-init and entrypoint script
# Entrypoint runs as root to fix permissions, then switches to node user
ENTRYPOINT ["dumb-init", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "src/index.js"]

