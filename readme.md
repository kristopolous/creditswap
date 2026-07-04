# creditswap.ai — AI Credit Marketplace

Buy and sell AI platform credits on an open marketplace. Get credits at a discount or sell unused credits from your SaaS accounts.

## Features

- **Order Book** — Market and limit orders for AI platform credits (OpenAI, Anthropic, Replicate, etc.)
- **Live Depth Chart** — Visualize buy and sell demand with an SVG order book chart
- **Price Ticker** — Scrolling ticker with green/red price changes
- **OAuth Sign-In** — GitHub, Google, or email/password (demo: `demo@demo.com` / `password`)
- **Separate Sign-Up** — Create a new account at `/auth/signup`
- **Go Proxy** — Standalone binary that intercepts API calls and rewrites them through creditswap.ai
- **Proxy Documentation** — Full guide at `/proxy-readme`
- **REST API v1** — Full programmatic access to services, orders, order book, and key management
- **API Docs** — Full reference at `/docs` with syntax highlighting and themed styling
- **Sell Order Expiration** — Optional expiration date on sell listings; auto-expired past-due orders
- **Limit Price Enforcement** — Sell-side limit orders require a price under $1.00
- **Discovery Agent** — Auto-infers credits-per-call from platform pricing pages on platform creation
- **Usage Logging & Accounting** — Every API call through the proxy is logged for transparent bookkeeping
- **Buyer Transparency** — `/usage/[id]` shows purchased vs. consumed credits, breakdown by endpoint and day, raw log, and dispute link
- **User Dashboard** — Two sections: Credits Bought (with usage log) and Credits for Sale (with market links to adjust limit orders)
- **Dark Glassmorphism UI** — Premium dark theme with gradients, blur effects, and animations

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | Auth.js v5 (next-auth@beta) |
| Styling | Tailwind CSS |
| Payments (planned) | Stripe + Coinbase Commerce SDKs installed |
| Proxy | Go (standalone binary) |
| Database | PostgreSQL 16 (Docker) |

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
# Edit .env.local with your keys (AUTH_SECRET is required; OAuth providers optional for demo)
# Generate secret: openssl rand -base64 32

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
| `STRIPE_SECRET_KEY` | No | Stripe secret key (SDK installed, integration pending) |
| `STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key |
| `COINBASE_COMMERCE_API_KEY` | No | Coinbase Commerce API key |

## API Documentation

Full API reference at [/docs](/docs) with syntax-highlighted code blocks and themed styling.

### Quick Reference

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/services` | List all platforms |
| `POST /api/v1/services` | Create a platform (auto-discovers credits per call) |
| `POST /api/v1/orders` | Create buy/sell order |
| `GET /api/v1/orderbook/:slug` | Order book + depth |
| `POST /api/v1/keys` | Purchase credits (market) |
| `GET /api/v1/keys/:key` | Validate proxy key |
| `POST /api/v1/keys/:key/use` | Deduct credits on API use (logs usage) |
| `POST /api/v1/usage/log` | Log an API call for bookkeeping |
| `GET /api/v1/buy-orders/:id/usage` | Usage stats for a buy order |
| `GET /api/v1/usage/:id` | Raw usage log entries |

## Discovery Agent

When a platform is created via `POST /api/v1/services`, the server automatically:

1. Checks a curated map of known platforms (OpenAI, Anthropic, Replicate, etc.)
2. For unknown platforms, fetches the pricing page (`{domain}/pricing`) and scans for dollar amounts
3. Stores the inferred `credits_per_call` on the platform record

## Usage Logging & Accounting

Every API call through the proxy is recorded in the `usage_log` table:

- **`POST /api/v1/keys/:key/use`** — Deducts credits AND logs the endpoint, method, and credits charged
- **`/usage/[id]`** — Buyer-facing transparency page showing purchased vs. consumed credits, breakdown by endpoint and day, and a dispute link
- **Escrow tracking** — Funds are released to sellers as credits are consumed (see `escrow_releases` table)

## Database

```bash
# PostgreSQL runs on port 5433 (configurable in docker-compose.yml)
docker compose up -d

# Connect
psql -h localhost -p 5433 -U creditswap -d creditswap
```

Schema documentation at [schema.md](./schema.md).

## Proxy

The Go proxy transparently rewrites API calls from the original host to creditswap.ai and logs usage for accounting.

```bash
cd proxy
go build -o creditswap-proxy
./creditswap-proxy --target api.openai.com --proxy-key <your-key> --platform openai
```

Configure your SDK/application to point at `http://127.0.0.1:8080` instead of the original API host.

## Dashboard

The user dashboard at `/dashboard` has two sections:

- **Credits Bought** — Each purchase shows credits purchased, API call count, credits consumed, remaining credits with a progress bar, and a link to the full usage log
- **Credits for Sale** — Each listing shows credits remaining, limit/market price, status, and links to change the limit price or view the current market

## License

MIT
