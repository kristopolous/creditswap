# creditswap API v1

Base URL: `https://creditswap.ai/api/v1`

All endpoints return JSON. Errors return `{ "error": "<message>" }` with an appropriate HTTP status code.

---

## Authentication

### `POST /api/v1/auth`

Get an auth token for API access.

**Request:**
```json
{ "email": "user@example.com" }
```

**Response: `200`**
```json
{
  "user": { "id": "user_1712345678", "email": "user@example.com", "name": "user" },
  "token": "csw_dXNlckBleGFtcGxlLmNvbQ==_abc123"
}
```

Use the token in the `Authorization` header for protected endpoints:
```
Authorization: Bearer csw_dXNlckBleGFtcGxlLmNvbQ==_abc123
```

---

## Services

### `GET /api/v1/services`

List all available services (platforms) for credit trading.

**Response: `200`**
```json
{
  "services": [
    {
      "id": "p1",
      "name": "Cloudify",
      "slug": "cloudify",
      "description": "Cloud compute and AI training credits.",
      "logo": "☁️",
      "apiEndpoint": "api.cloudify.com",
      "supported": true,
      "discoverable": true
    }
  ]
}
```

### `POST /api/v1/services`

Add a new service to the marketplace. The API will attempt to discover the credits mechanism.

**Request:**
```json
{
  "name": "MyService",
  "apiEndpoint": "api.myservice.com",
  "description": "AI API credits for MyService."
}
```

**Response: `201`**
```json
{
  "service": {
    "id": "p11",
    "name": "MyService",
    "slug": "myservice",
    "description": "AI API credits for MyService.",
    "logo": "🔮",
    "apiEndpoint": "api.myservice.com",
    "supported": true,
    "discoverable": true
  }
}
```

### `GET /api/v1/services/:slug`

Get detailed information about a specific service, including market stats and depth data.

**Response: `200`**
```json
{
  "service": { "id": "p1", "name": "Cloudify", "slug": "cloudify", ... },
  "stats": {
    "asks": 2,
    "bids": 3,
    "availableCredits": 12500,
    "totalDemand": 10000
  },
  "depth": [
    { "price": 0.10, "buyVolume": 2000, "sellVolume": 0 },
    { "price": 0.20, "buyVolume": 0, "sellVolume": 5000 }
  ]
}
```

---

## Orders

### `GET /api/v1/orders`

List all orders. Supports optional query parameters.

**Query Parameters:**
| Param        | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `platformId` | string | Filter by platform ID                    |
| `side`       | string | Filter by side: `"buy"` or `"sell"`      |

**Response: `200`**
```json
{
  "orders": {
    "sells": [
      { "id": "so1", "platformId": "p1", "pricePerCredit": 0.23, "availableCredits": 7500, "type": "limit", "status": "active" }
    ],
    "buys": [
      { "id": "bo1", "platformId": "p1", "pricePerCredit": 0.18, "amount": 3000, "type": "limit", "status": "pending" }
    ]
  }
}
```

When `side` is specified:
```json
{
  "orders": [ ... ]
}
```

### `POST /api/v1/orders`

Create a buy or sell order.

**Request:**
```json
{
  "side": "buy",
  "platformId": "p1",
  "platformName": "Cloudify",
  "amount": 100,
  "pricePerCredit": 0.20,
  "type": "market"
}
```

| Field            | Type   | Required | Description                                      |
|-----------------|--------|----------|--------------------------------------------------|
| `side`          | string | yes      | `"buy"` or `"sell"`                              |
| `platformId`    | string | yes      | ID of the service                                |
| `platformName`  | string | no       | Display name (defaults to platformId)             |
| `amount`        | number | yes      | Number of credits                                |
| `pricePerCredit`| number | yes      | Price per credit (must be < $1.00)               |
| `type`          | string | yes      | `"market"` or `"limit"`                          |

**Market Buy Response: `201`**
```json
{
  "id": "bo8",
  "platformId": "p1",
  "amount": 100,
  "pricePerCredit": 0.20,
  "type": "market",
  "status": "completed",
  "side": "buy",
  "proxyKey": "csw_cloudify_m1x2a3_b4c5d6e",
  "fee": 3.00,
  "totalPrice": 20.00,
  "createdAt": "2026-07-03T12:00:00.000Z"
}
```

**Limit Buy Response: `201`**
```json
{
  "id": "bo9",
  "platformId": "p1",
  "amount": 100,
  "pricePerCredit": 0.15,
  "type": "limit",
  "status": "pending",
  "side": "buy",
  "createdAt": "2026-07-03T12:00:00.000Z"
}
```

**Sell Response: `201`**
```json
{
  "id": "so7",
  "platformId": "p1",
  "amount": 500,
  "pricePerCredit": 0.25,
  "type": "limit",
  "status": "active",
  "side": "sell",
  "createdAt": "2026-07-03T12:00:00.000Z"
}
```

---

## Order Book

### `GET /api/v1/orderbook/:service`

Get the order book for a specific service (by slug).

**Response: `200`**
```json
{
  "service": "cloudify",
  "spread": {
    "bid": 0.18,
    "ask": 0.20,
    "spread": 0.02
  },
  "asks": [
    { "price": 0.20, "volume": 5000, "type": "market", "orderId": "so2" },
    { "price": 0.23, "volume": 7500, "type": "limit", "orderId": "so1" }
  ],
  "bids": [
    { "price": 0.18, "volume": 3000, "type": "limit", "orderId": "bo1" },
    { "price": 0.15, "volume": 5000, "type": "limit", "orderId": "bo2" }
  ],
  "depth": [
    { "price": 0.10, "buyVolume": 2000, "sellVolume": 0 },
    { "price": 0.20, "buyVolume": 0, "sellVolume": 5000 }
  ]
}
```

---

## Keys

### `POST /api/v1/keys`

Purchase credits and generate an API key. Key is tied to `user + service + demandRate`.

**Request:**
```json
{
  "platformId": "p1",
  "platformName": "Cloudify",
  "amount": 100,
  "pricePerCredit": 0.20
}
```

**Response: `201`**
```json
{
  "key": "csw_cloudify_m1x2a3_b4c5d6e",
  "orderId": "bo8",
  "platformId": "p1",
  "platformName": "Cloudify",
  "amount": 100,
  "totalPrice": 20.00,
  "fee": 3.00,
  "status": "completed"
}
```

The `key` field is the proxy key. Use it with the creditswap proxy or the key validation endpoints.

### `GET /api/v1/keys/:key`

Validate an API key and check its status and remaining credits.

**Response: `200`**
```json
{
  "valid": true,
  "key": "csw_cloudify_m1x2a3_b4c5d6e",
  "userId": "anonymous",
  "platformSlug": "cloudify",
  "platformId": "p1",
  "remainingCredits": 90.0,
  "totalCredits": 100.0,
  "demandRate": 0.02,
  "status": "active"
}
```

**Response: `404`**
```json
{ "error": "invalid or expired key" }
```

### `POST /api/v1/keys/:key/use`

Deduct credits at the key's demand rate. Called by the creditswap proxy on each request.

**Response: `200`**
```json
{
  "status": "active",
  "remainingCredits": 89.98,
  "demandRate": 0.02,
  "consumed": 0.02
}
```

**Response: `402`** (when credits exhausted)
```json
{ "error": "key is exhausted" }
```

---

## Error Codes

| Status | Description                          |
|--------|--------------------------------------|
| 400    | Bad request — missing or invalid fields |
| 402    | Payment required — credits exhausted  |
| 404    | Resource not found                   |
| 500    | Internal server error                |

---

## Price Rules

- All prices are in USD.
- `pricePerCredit` must be under **$1.00**.
- A **15% transaction fee** is applied to all purchases.
- Market buys consume from the cheapest available sell orders first.
- Limit orders sit in the order book until matched.
