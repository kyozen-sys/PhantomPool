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

COPY --from=builder /app/server /app/server

RUN useradd -m appuser && chown appuser:appuser /app/server

USER appuser

EXPOSE 4000

CMD ["./server"]
