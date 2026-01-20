FROM oven/bun:1.3.6 AS builder

WORKDIR /app

COPY bun.lock tsconfig.json package.json ./

RUN bun install --frozen-lockfile

COPY src ./src

RUN bun build src/server.ts --compile --target bun-linux-x64 --outfile server

FROM debian:bookworm-slim AS production

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends xvfb chromium \
    fonts-liberation \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_PATH=/usr/bin/chromium

ENV NODE_ENV=production

ENV HOST=0.0.0.0

ENV PORT=4000

ENV BROWSER_POOL_SIZE=1

ENV BROWSER_POOL_RETRYMS=3000

ENV BROWSER_LEASE_TIMEOUTMS=60000

ENV QUEUE_MAXJOBS=10

ENV QUEUE_RETRYMS=100

COPY --from=builder /app/server /app/server

RUN useradd -m appuser && chown appuser:appuser /app/server

USER appuser

EXPOSE ${PORT}

CMD ["./server"]
