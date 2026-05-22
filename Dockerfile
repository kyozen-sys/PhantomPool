FROM oven/bun:1.3.6 AS deps

WORKDIR /app

COPY bun.lock package.json ./

RUN bun install --frozen-lockfile

FROM oven/bun:1.3.6 AS production

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    xvfb chromium fonts-liberation ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_PATH=/usr/bin/chromium

ENV NODE_ENV=production

ENV HOST=0.0.0.0

ENV PORT=4000

ENV BROWSER_POOL_SIZE=1

ENV BROWSER_LEASE_PERBROWSER=10
ENV BROWSER_LEASE_TIMEOUTMS=60000

ENV QUEUE_MAXJOBS=10

COPY --from=deps /app/node_modules ./node_modules

COPY src ./src

COPY package.json tsconfig.json ./

USER bun

EXPOSE ${PORT}

CMD ["bun", "run", "start"]
