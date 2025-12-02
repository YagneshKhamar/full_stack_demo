# -------- BASE IMAGE --------
FROM node:22-bookworm-slim AS base
WORKDIR /app
# DO NOT set NODE_ENV here

RUN apt-get update && apt-get install -y \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# -------- DEPS STAGE (prod deps) --------
FROM base AS deps
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# -------- BUILD STAGE --------
FROM base AS builder
WORKDIR /app

# Prisma needs this at build time
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Install ALL deps (including dev) – force NODE_ENV only for this command
COPY package.json package-lock.json ./
RUN NODE_ENV=development npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Now build in proper production mode
ENV NODE_ENV=production
RUN npm run build

# -------- RUNTIME STAGE --------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Prod dependencies only
COPY --from=deps /app/node_modules ./node_modules

# Build output + prisma files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
