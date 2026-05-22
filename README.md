# PhantomPool

[![CI](https://github.com/kyozen-sys/PhantomPool/actions/workflows/ci.yml/badge.svg)](https://github.com/kyozen-sys/PhantomPool/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/kyozen-sys/PhantomPool)](LICENSE)

Browser pool built around a simple idea:

> if you’re going to run real browsers, you need control — not just concurrency.

I built this because most Cloudflare bypass tools I found either:

- don’t scale,
- spawn browsers per request,
- or completely fall apart under concurrent load.

PhantomPool focuses on **orchestrating browsers**, not abusing them.

---

### What it does

- Keeps a **persistent pool of real Chromium instances**
- Uses **leases** to guarantee exclusive browser access
- Applies **hard cancellation** on timeouts and disconnects
- Uses a **bounded queue** to apply backpressure

That’s it. No magic.

---

### What it does _not_ do

- No fingerprint spoofing
- No TLS / JA3 tricks
- No exploit-based bypasses

If the browser can’t load the page, PhantomPool won’t pretend it can.

---

### How it works (high level)

```
HTTP request
  → Queue (bounded)
    → Worker
      → Browser lease
        → Chromium
```

Each request becomes a job.
Each job needs a lease.
Each lease owns a browser until it finishes or is cancelled.

---

### Why leases instead of “just a pool”

Because without leases:

- browsers get reused while dirty
- cancellation becomes best-effort
- bugs turn into ghost states

Leases give PhantomPool:

- authority
- cleanup guarantees
- predictable failure modes

---

### Run locally

Requires [Bun](https://bun.sh).

```bash
bun install
bun start
```

For hot-reload during development:

```bash
bun start:dev
```

---

### Docker

```bash
docker build -t phantompool .
docker run -p 4000:4000 phantompool
```

Chromium is bundled in the image.

---

### Current state

This project is:

- stable under load
- intentionally minimal
- still evolving

Things that can improve:

- priority / weighted scheduling
- metrics
- multiple browser types
- distributed workers

PRs are welcome.

---

### License

MIT
