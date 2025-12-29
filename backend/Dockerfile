# -----------------------------
# DevSecOps Backend Dockerfile
# Multi-stage build with security hardening
# -----------------------------

# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Security: Don't run as root during build
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Stage 2: Production
FROM node:20-alpine AS runner

# Security labels
LABEL org.opencontainers.image.title="DevSecOps Backend"
LABEL org.opencontainers.image.description="Secure backend API for DevSecOps demonstration"
LABEL org.opencontainers.image.vendor="DevSecOps Team"
LABEL org.opencontainers.image.source="https://github.com/himanm/DevOps-Project-11"

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Security: Remove unnecessary packages and update
RUN apk --no-cache add dumb-init && \
    apk upgrade --no-cache && \
    npm install -g npm@latest

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps --chown=expressjs:nodejs /app/node_modules ./node_modules

# Copy application source (explicitly copy everything, then the src folder)
COPY --chown=expressjs:nodejs . .
COPY --chown=expressjs:nodejs src/ ./src/

# Security: Set proper permissions
RUN chmod -R 550 /app && \
    chmod -R 770 /app/node_modules

# Environment configuration
ENV NODE_ENV=production
ENV PORT=3001

# Security: Run as non-root user
USER expressjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/index.js"]
