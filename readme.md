# creditswap.ai — AI Credit Marketplace

Buy and sell AI platform credits on an open marketplace. Get credits at a discount or sell unused credits from your SaaS accounts.

## Features

- **Order Book** — Market and limit orders for AI platform credits (OpenAI, Anthropic, Replicate, etc.)
- **Live Depth Chart** — Visualize buy and sell demand with an SVG order book chart
- **Price Ticker** — Scrolling ticker with green/red price changes
- **OAuth Sign-In** — GitHub, Google, or email/password (demo: `demo@demo.com` / `password`)
- **Go Proxy** — Standalone binary that intercepts API calls and rewrites them through creditswap.ai
- **Stripe & Coinbase** — Pay with credit card (ACH via Link) or cryptocurrency
- **REST API v1** — Full programmatic access to services, orders, order book, and key management
- **Dark Glassmorphism UI** — Premium dark theme with gradients, blur effects, and animations

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | Auth.js v5 (next-auth@beta) |
| Styling | Tailwind CSS |
| Payments | Stripe + Coinbase Commerce |
| Proxy | Go (standalone binary) |
| Database | PostgreSQL (Docker) |
| Tests | Jest |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- Go 1.22+ (for proxy binary)

### Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your keys (OAuth providers optional for demo)

# Start the database
docker compose up -d

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with `demo@demo.com` / `password`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | Session encryption key (`openssl rand -base64 32`) |
| `AUTH_GITHUB_ID` | No | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | No | GitHub OAuth client secret |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (live/test) |
| `STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key |
| `COINBASE_COMMERCE_API_KEY` | No | Coinbase Commerce API key |

## API Documentation

Full API reference at [/docs](/docs).

### Quick Reference

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/services` | List all platforms |
| `POST /api/v1/orders` | Create buy/sell order |
| `GET /api/v1/orderbook/:slug` | Order book + depth |
| `POST /api/v1/keys` | Purchase credits (market) |
| `GET /api/v1/keys/:key` | Validate proxy key |
| `POST /api/v1/keys/:key/use` | Deduct credits on API use |

## Database

```bash
# PostgreSQL runs on port 5433 (configurable in docker-compose.yml)
docker compose up -d

# Connect
psql -h localhost -p 5433 -U creditswap -d creditswap
```

Schema documentation at [schema.md](./schema.md).

## Proxy

The Go proxy transparently rewrites API calls from the original host to creditswap.ai.

```bash
cd proxy
go build -o creditswap-proxy
./creditswap-proxy
```

Configure your SDK/application to point at `http://127.0.0.1:8080` instead of the original API host.

## Tests

```bash
npm test
```

## License

MIT
