import { describe, it, expect, beforeAll, afterAll } from "@jest/globals"

const BASE = "http://localhost:3001/api/v1"

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body }
}

describe("creditswap API v1", () => {
  // ── Services ──────────────────────────────────────────────

  describe("GET /services", () => {
    it("returns a list of services", async () => {
      const { status, body } = await api("/services")
      expect(status).toBe(200)
      expect(Array.isArray(body.services)).toBe(true)
      expect(body.services.length).toBeGreaterThan(0)
      expect(body.services[0]).toHaveProperty("id")
      expect(body.services[0]).toHaveProperty("name")
      expect(body.services[0]).toHaveProperty("slug")
    })
  })

  describe("POST /services", () => {
    it("creates a new service", async () => {
      const { status, body } = await api("/services", {
        method: "POST",
        body: JSON.stringify({ name: "TestService", apiEndpoint: "api.testservice.io" }),
      })
      expect(status).toBe(201)
      expect(body.service.name).toBe("TestService")
      expect(body.service.slug).toBe("testservice")
    })

    it("rejects a request without a name", async () => {
      const { status, body } = await api("/services", {
        method: "POST",
        body: JSON.stringify({}),
      })
      expect(status).toBe(400)
      expect(body.error).toBeTruthy()
    })
  })

  describe("GET /services/:slug", () => {
    it("returns service details", async () => {
      const { status, body } = await api("/services/cloudify")
      expect(status).toBe(200)
      expect(body.service.slug).toBe("cloudify")
      expect(body.stats).toBeDefined()
      expect(typeof body.stats.asks).toBe("number")
      expect(typeof body.stats.availableCredits).toBe("number")
    })

    it("returns 404 for unknown service", async () => {
      const { status } = await api("/services/nonexistent")
      expect(status).toBe(404)
    })
  })

  // ── Orders ────────────────────────────────────────────────

  describe("GET /orders", () => {
    it("returns orders", async () => {
      const { status, body } = await api("/orders")
      expect(status).toBe(200)
      expect(body.orders).toBeDefined()
      expect(Array.isArray(body.orders.sells)).toBe(true)
    })

    it("filters by platformId", async () => {
      const { status, body } = await api("/orders?platformId=p1")
      expect(status).toBe(200)
      for (const o of body.orders.sells) {
        expect(o.platformId).toBe("p1")
      }
    })

    it("filters by side=sell", async () => {
      const { status, body } = await api("/orders?side=sell")
      expect(status).toBe(200)
      expect(Array.isArray(body.orders)).toBe(true)
    })
  })

  describe("POST /orders", () => {
    it("creates a market buy order", async () => {
      const { status, body } = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          side: "buy",
          platformId: "p1",
          platformName: "Cloudify",
          amount: 50,
          pricePerCredit: 0.20,
          type: "market",
        }),
      })
      expect(status).toBe(201)
      expect(body.side).toBe("buy")
      expect(body.status).toBe("completed")
      expect(body.proxyKey).toBeTruthy()
      const parts = body.proxyKey.split("-")
      expect(parts.length).toBe(3)
      expect(parts[1]).toBe("cloudify")
      expect(parseInt(parts[2], 10)).toBe(20000)
    })

    it("creates a limit buy order", async () => {
      const { status, body } = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          side: "buy",
          platformId: "p1",
          platformName: "Cloudify",
          amount: 200,
          pricePerCredit: 0.12,
          type: "limit",
        }),
      })
      expect(status).toBe(201)
      expect(body.side).toBe("buy")
      expect(body.status).toBe("pending")
      expect(body.proxyKey).toBeUndefined()
    })

    it("creates a sell order", async () => {
      const { status, body } = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          side: "sell",
          platformId: "p2",
          platformName: "OpenAI",
          amount: 500,
          pricePerCredit: 0.80,
          type: "limit",
        }),
      })
      expect(status).toBe(201)
      expect(body.side).toBe("sell")
      expect(body.status).toBe("active")
    })

    it("rejects price >= $1.00", async () => {
      const { status, body } = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          side: "buy",
          platformId: "p1",
          amount: 100,
          pricePerCredit: 1.50,
          type: "market",
        }),
      })
      expect(status).toBe(400)
      expect(body.error).toContain("$1.00")
    })

    it("rejects missing required fields", async () => {
      const { status, body } = await api("/orders", {
        method: "POST",
        body: JSON.stringify({ side: "buy" }),
      })
      expect(status).toBe(400)
    })
  })

  // ── Order Book ────────────────────────────────────────────

  describe("GET /orderbook/:service", () => {
    it("returns the order book for a service", async () => {
      const { status, body } = await api("/orderbook/cloudify")
      expect(status).toBe(200)
      expect(body.service).toBe("cloudify")
      expect(Array.isArray(body.asks)).toBe(true)
      expect(Array.isArray(body.bids)).toBe(true)
      expect(Array.isArray(body.depth)).toBe(true)
      expect(body.asks.length).toBeGreaterThan(0)
    })

    it("returns sorted asks (ascending) and bids (descending)", async () => {
      const { status, body } = await api("/orderbook/cloudify")
      expect(status).toBe(200)
      for (let i = 1; i < body.asks.length; i++) {
        expect(body.asks[i].price).toBeGreaterThanOrEqual(body.asks[i - 1].price)
      }
      for (let i = 1; i < body.bids.length; i++) {
        expect(body.bids[i].price).toBeLessThanOrEqual(body.bids[i - 1].price)
      }
    })

    it("returns spread when both sides exist", async () => {
      const { status, body } = await api("/orderbook/cloudify")
      expect(status).toBe(200)
      if (body.asks.length > 0 && body.bids.length > 0) {
        expect(body.spread).toBeDefined()
        expect(typeof body.spread.bid).toBe("number")
        expect(typeof body.spread.ask).toBe("number")
      }
    })

    it("returns 404 for unknown service", async () => {
      const { status } = await api("/orderbook/nonexistent")
      expect(status).toBe(404)
    })
  })

  // ── Keys ──────────────────────────────────────────────────

  describe("POST /keys", () => {
    it("generates a new API key", async () => {
      const { status, body } = await api("/keys", {
        method: "POST",
        body: JSON.stringify({
          platformId: "p3",
          platformName: "Anthropic",
          amount: 100,
          pricePerCredit: 0.78,
        }),
      })
      expect(status).toBe(201)
      expect(body.key).toBeTruthy()
      const parts = body.key.split("-")
      expect(parts.length).toBe(3)
      expect(parts[1]).toBe("cloudify")
      expect(parseInt(parts[2], 10)).toBe(78000)
    })

    it("rejects price >= $1.00", async () => {
      const { status, body } = await api("/keys", {
        method: "POST",
        body: JSON.stringify({
          platformId: "p1",
          amount: 100,
          pricePerCredit: 2.00,
        }),
      })
      expect(status).toBe(400)
    })
  })

  describe("GET /keys/:key", () => {
    it("validates a real key", async () => {
      const create = await api("/keys", {
        method: "POST",
        body: JSON.stringify({ platformId: "p1", platformName: "Cloudify", amount: 500, pricePerCredit: 0.20 }),
      })
      const key = create.body.key

      const { status, body } = await api(`/keys/${key}`)
      expect(status).toBe(200)
      expect(body.valid).toBe(true)
      expect(body.key).toBe(key)
      expect(body.remainingCredits).toBeGreaterThan(0)
      expect(body.demandRate).toBeGreaterThan(0)
    })

    it("returns 404 for invalid key", async () => {
      const { status } = await api("/keys/invalid_key_123")
      expect(status).toBe(404)
    })
  })

  describe("POST /keys/:key/use", () => {
    it("deducts credits and returns new balance", async () => {
      const create = await api("/keys", {
        method: "POST",
        body: JSON.stringify({ platformId: "p1", platformName: "Cloudify", amount: 100, pricePerCredit: 0.20 }),
      })
      const key = create.body.key
      const initialCredits = create.body.totalPrice * 0.1

      const use1 = await api(`/keys/${key}/use`, { method: "POST" })
      expect(use1.status).toBe(200)
      expect(use1.body.remainingCredits).toBeLessThan(initialCredits)
      expect(use1.body.consumed).toBeGreaterThan(0)
      expect(use1.body.status).toBe("active")
    })

    it("returns 402 when credits exhausted", async () => {
      const create = await api("/keys", {
        method: "POST",
        body: JSON.stringify({ platformId: "p1", platformName: "Cloudify", amount: 1, pricePerCredit: 0.01 }),
      })
      const key = create.body.key

      for (let i = 0; i < 20; i++) {
        const r = await api(`/keys/${key}/use`, { method: "POST" })
        if (r.status === 402) break
      }

      const { status, body } = await api(`/keys/${key}/use`, { method: "POST" })
      expect(status).toBe(402)
      expect(body.error).toBeTruthy()
    })
  })

  // ── Cost Types ────────────────────────────────────────────

  describe("POST /usage/log (cost types)", () => {
    it("logs per-call cost by default", async () => {
      const create = await api("/keys", {
        method: "POST",
        body: JSON.stringify({ platformId: "p1", platformName: "Cloudify", amount: 200, pricePerCredit: 0.20 }),
      })
      const key = create.body.key

      const res = await api("/usage/log", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: JSON.stringify({ endpoint: "/test", method: "GET" }),
      })
      expect(res.status).toBe(200)
      expect(res.body.costType).toBe("per_call")
      expect(res.body.rate).toBeNull()
      expect(res.body.unit).toBeNull()
    })

    it("logs ongoing cost with rate and unit", async () => {
      const create = await api("/keys", {
        method: "POST",
        body: JSON.stringify({ platformId: "p1", platformName: "Cloudify", amount: 500, pricePerCredit: 0.20 }),
      })
      const key = create.body.key

      const res = await api("/usage/log", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          endpoint: "/vm/start",
          method: "POST",
          costType: "ongoing",
          rate: 10,
          unit: "hour",
        }),
      })
      expect(res.status).toBe(200)
      expect(res.body.costType).toBe("ongoing")
      expect(res.body.rate).toBe(10)
      expect(res.body.unit).toBe("hour")
      expect(res.body.consumed).toBe(10)
    })

    it("logs ongoing cost via /keys/:key/use", async () => {
      const create = await api("/keys", {
        method: "POST",
        body: JSON.stringify({ platformId: "p1", platformName: "Cloudify", amount: 300, pricePerCredit: 0.20 }),
      })
      const key = create.body.key

      const res = await api(`/keys/${key}/use`, {
        method: "POST",
        body: JSON.stringify({
          endpoint: "/vm/run",
          method: "GET",
          costType: "ongoing",
          rate: 5,
          unit: "hour",
        }),
      })
      expect(res.status).toBe(200)
      expect(res.body.costType).toBe("ongoing")
      expect(res.body.rate).toBe(5)
      expect(res.body.unit).toBe("hour")
    })
  })

  // ── Auth ──────────────────────────────────────────────────

  describe("POST /auth", () => {
    it("returns a token for valid email", async () => {
      const { status, body } = await api("/auth", {
        method: "POST",
        body: JSON.stringify({ email: "test@creditswap.ai" }),
      })
      expect(status).toBe(200)
      expect(body.token).toBeTruthy()
      expect(body.token).toContain("csw_")
      expect(body.user.email).toBe("test@creditswap.ai")
    })

    it("rejects missing email", async () => {
      const { status, body } = await api("/auth", {
        method: "POST",
        body: JSON.stringify({}),
      })
      expect(status).toBe(400)
      expect(body.error).toBeTruthy()
    })
  })
})
