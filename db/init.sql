-- creditswap.ai — PostgreSQL schema + seed data
-- Run: psql -U creditswap -d creditswap -f db/init.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Users ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(320) UNIQUE NOT NULL,
  name       VARCHAR(255),
  image      TEXT,
  role       VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ── Platforms ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS platforms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) UNIQUE NOT NULL,
  description   TEXT,
  logo          VARCHAR(50) DEFAULT '🔮',
  api_endpoint  VARCHAR(512) NOT NULL,
  supported     BOOLEAN DEFAULT true,
  discoverable  BOOLEAN DEFAULT true,
  credits_per_call  NUMERIC(10,6),       -- default credits consumed per API call (NULL = unknown)
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platforms_slug ON platforms (slug);

-- ── Sell Orders ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sell_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id       UUID NOT NULL REFERENCES platforms(id),
  seller_id         UUID REFERENCES users(id),
  seller_key        VARCHAR(255) NOT NULL,
  total_credits     NUMERIC(20,2) NOT NULL,
  available_credits NUMERIC(20,2) NOT NULL,
  price_per_credit  NUMERIC(10,4) NOT NULL CHECK (price_per_credit >= 0 AND price_per_credit < 1.00),
  type              VARCHAR(10) NOT NULL DEFAULT 'limit',
  status            VARCHAR(20) NOT NULL DEFAULT 'active',
  expires_at        TIMESTAMPTZ,
  escrow_balance    NUMERIC(20,2) DEFAULT 0 NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ck_sell_available CHECK (available_credits >= 0 AND available_credits <= total_credits)
);

CREATE INDEX IF NOT EXISTS idx_sell_orders_platform ON sell_orders (platform_id);
CREATE INDEX IF NOT EXISTS idx_sell_orders_status  ON sell_orders (status);
CREATE INDEX IF NOT EXISTS idx_sell_orders_price   ON sell_orders (price_per_credit);

-- ── Buy Orders ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS buy_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id       UUID NOT NULL REFERENCES platforms(id),
  buyer_id          UUID REFERENCES users(id),
  amount            NUMERIC(20,2) NOT NULL,
  price_per_credit  NUMERIC(10,4) NOT NULL CHECK (price_per_credit > 0 AND price_per_credit < 1.00),
  total_price       NUMERIC(20,2) NOT NULL,
  fee               NUMERIC(20,2) NOT NULL,
  fee_percentage    NUMERIC(5,4) NOT NULL DEFAULT 0.15,
  type              VARCHAR(10) NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending',
  proxy_key_id      UUID,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buy_orders_platform     ON buy_orders (platform_id);
CREATE INDEX IF NOT EXISTS idx_buy_orders_status       ON buy_orders (status);
CREATE INDEX IF NOT EXISTS idx_buy_orders_price_desc   ON buy_orders (price_per_credit DESC);

-- ── API Keys ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_keys (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key                VARCHAR(255) UNIQUE NOT NULL,
  user_id            UUID REFERENCES users(id),
  platform_id        UUID NOT NULL REFERENCES platforms(id),
  demand_rate        NUMERIC(10,6) NOT NULL,
  remaining_credits  NUMERIC(20,2) NOT NULL,
  total_credits      NUMERIC(20,2) NOT NULL,
  status             VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at         TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ck_api_remaining CHECK (remaining_credits >= 0)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key    ON api_keys (key);
CREATE INDEX IF NOT EXISTS idx_api_keys_user   ON api_keys (user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys (status);

-- ── Transactions ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buy_order_id   UUID NOT NULL REFERENCES buy_orders(id),
  sell_order_id  UUID NOT NULL REFERENCES sell_orders(id),
  platform_id    UUID NOT NULL REFERENCES platforms(id),
  credits        NUMERIC(20,2) NOT NULL,
  price          NUMERIC(10,4) NOT NULL,
  total          NUMERIC(20,2) NOT NULL,
  fee            NUMERIC(20,2) NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_buy      ON transactions (buy_order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sell     ON transactions (sell_order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_platform ON transactions (platform_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created  ON transactions (created_at);

-- ── Usage Log ───────────────────────────────────────────────
-- Every API call through the proxy is recorded here for bookkeeping.

CREATE TABLE IF NOT EXISTS usage_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id      UUID NOT NULL REFERENCES api_keys(id),
  buy_order_id    UUID REFERENCES buy_orders(id),
  platform_id     UUID NOT NULL REFERENCES platforms(id),
  endpoint        VARCHAR(512) NOT NULL,
  method          VARCHAR(10) NOT NULL,
  credits_charged NUMERIC(20,2) NOT NULL,
  status_code     INT,
  ip_address      VARCHAR(45),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_log_key     ON usage_log (api_key_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_buy     ON usage_log (buy_order_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_platform ON usage_log (platform_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_created  ON usage_log (created_at);

-- ── Escrow Releases ─────────────────────────────────────────
-- Tracks when funds are released to sellers as credits are consumed.

CREATE TABLE IF NOT EXISTS escrow_releases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buy_order_id    UUID NOT NULL REFERENCES buy_orders(id),
  sell_order_id   UUID NOT NULL REFERENCES sell_orders(id),
  credits         NUMERIC(20,2) NOT NULL,
  amount          NUMERIC(20,2) NOT NULL,
  fee             NUMERIC(20,2) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  released_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_escrow_releases_buy  ON escrow_releases (buy_order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_releases_sell ON escrow_releases (sell_order_id);

-- ════════════════════════════════════════════════════════════
-- SEED DATA
-- ════════════════════════════════════════════════════════════

-- Platforms (10)
INSERT INTO platforms (name, slug, description, logo, api_endpoint) VALUES
  ('Cloudify',     'cloudify',    'Cloud compute and AI training credits.',          '☁️',  'api.cloudify.com'),
  ('OpenAI',       'openai',      'GPT API credits for language models.',             '🤖',  'api.openai.com'),
  ('Anthropic',    'anthropic',   'Claude API credits for safe AI assistants.',        '🧠',  'api.anthropic.com'),
  ('Replicate',    'replicate',   'Run open-source models with API credits.',          '🔄',  'api.replicate.com'),
  ('Hugging Face', 'huggingface', 'Inference API credits for community models.',        '🤗',  'api.huggingface.co'),
  ('Together AI',  'together',    'API credits for open-source language models.',       '🔗',  'api.together.xyz'),
  ('ElevenLabs',   'elevenlabs',  'AI voice synthesis and TTS API credits.',           '🎙️',  'api.elevenlabs.io'),
  ('Midjourney',   'midjourney',  'AI image generation credits.',                      '🎨',  'api.midjourney.com'),
  ('Stability AI', 'stability',   'Stable Diffusion and generative media API credits.', '✨',  'api.stability.ai'),
  ('Perplexity',   'perplexity',  'AI search and research assistant API credits.',      '🔍',  'api.perplexity.ai');

-- Sell Orders (6) — reference platforms by slug subquery
INSERT INTO sell_orders (platform_id, seller_key, total_credits, available_credits, price_per_credit, type, status)
SELECT p.id, 'ck_xxxxxxxxxxxx', 10000, 7500, 0.2300, 'limit',  'active' FROM platforms p WHERE p.slug = 'cloudify'    UNION ALL
SELECT p.id, 'ck_yyyyyyyyyyyy',  5000, 5000, 0.2000, 'market', 'active' FROM platforms p WHERE p.slug = 'cloudify'    UNION ALL
SELECT p.id, 'sk_xxxxxxxxxxxx', 25000, 18000, 0.8500, 'limit',  'active' FROM platforms p WHERE p.slug = 'openai'      UNION ALL
SELECT p.id, 'sk_yyyyyyyyyyyy', 15000, 12000, 0.7800, 'limit',  'active' FROM platforms p WHERE p.slug = 'anthropic'   UNION ALL
SELECT p.id, 'rk_xxxxxxxxxxxx',  8000,  6000, 0.4500, 'market', 'active' FROM platforms p WHERE p.slug = 'replicate'   UNION ALL
SELECT p.id, 'hf_xxxxxxxxxxxx', 30000, 25000, 0.5000, 'limit',  'active' FROM platforms p WHERE p.slug = 'huggingface';

-- Buy Orders (7)
INSERT INTO buy_orders (platform_id, amount, price_per_credit, total_price, fee, type, status)
SELECT p.id, 3000, 0.18,  540,   81,    'limit', 'pending' FROM platforms p WHERE p.slug = 'cloudify'   UNION ALL
SELECT p.id, 5000, 0.15,  750,   112.5, 'limit', 'pending' FROM platforms p WHERE p.slug = 'cloudify'   UNION ALL
SELECT p.id, 2000, 0.10,  200,   30,    'limit', 'pending' FROM platforms p WHERE p.slug = 'cloudify'   UNION ALL
SELECT p.id, 5000, 0.75,  3750,  562.5, 'limit', 'pending' FROM platforms p WHERE p.slug = 'openai'     UNION ALL
SELECT p.id, 3000, 0.70,  2100,  315,   'limit', 'pending' FROM platforms p WHERE p.slug = 'openai'     UNION ALL
SELECT p.id, 4000, 0.70,  2800,  420,   'limit', 'pending' FROM platforms p WHERE p.slug = 'anthropic'  UNION ALL
SELECT p.id, 2000, 0.65,  1300,  195,   'limit', 'pending' FROM platforms p WHERE p.slug = 'anthropic';
