# syntax=docker/dockerfile:1

# ================================
# Stage 1: Install dependencies
# ================================
FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ================================
# Stage 2: Build the application
# ================================
FROM oven/bun:1 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time args (NEXT_PUBLIC_* vars are baked into the bundle)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_USE_MOCK_API=false
ARG NEXT_PUBLIC_USE_MOCK_POLICIES=false

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_USE_MOCK_API=${NEXT_PUBLIC_USE_MOCK_API}
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# ================================
# Stage 3: Production runtime
# ================================
FROM oven/bun:1 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["bun", "server.js"]
