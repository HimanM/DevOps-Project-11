# -----------------------------
# DevSecOps Frontend Dockerfile
# Multi-stage build with security hardening
# -----------------------------

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --ignore-scripts && npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine AS runner

# Security labels
LABEL org.opencontainers.image.title="DevSecOps Frontend"
LABEL org.opencontainers.image.description="Next.js frontend for DevSecOps demonstration"
LABEL org.opencontainers.image.vendor="DevSecOps Team"
LABEL org.opencontainers.image.source="https://github.com/himanm/DevOps-Project-11"

WORKDIR /app

# Security: Set to production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    npm install -g npm@latest

# Copy necessary files for standalone mode
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Security: Run as non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
# Health check - use lightweight endpoint and relaxed timeouts
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "server.js"]
