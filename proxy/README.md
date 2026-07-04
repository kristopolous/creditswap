# creditswap Proxy

A lightweight Go proxy that intercepts API calls to your AI platform and transparently routes them through creditswap.ai.

When you buy credits on creditswap, you receive a **proxy key**. This proxy rewrites requests from the original API host (e.g., `api.openai.com`) to `creditswap.ai/{platform}`, injecting your proxy key as a Bearer token. Your SDK or application thinks it's talking directly to the platform, but creditswap handles authentication, credit deduction, and forwarding.

## Build

```bash
cd proxy
go build -o creditswap-proxy
```

## Usage

```
./creditswap-proxy --target <api-host> --proxy-key <key> --platform <slug>
```

| Flag          | Required | Description                                      |
|---------------|----------|--------------------------------------------------|
| `--target`    | yes      | Original API host to intercept (e.g. `api.openai.com`) |
| `--proxy-key` | yes      | Your creditswap.ai proxy key                     |
| `--platform`  | yes      | Platform slug (e.g. `openai`)                    |
| `--port`      | no       | Local port (default `8080`)                      |

### Example

```bash
./creditswap-proxy \
  --target api.openai.com \
  --proxy-key csw_openai_a1b2c3_d4e5f6 \
  --platform openai
```

Output:
```
creditswap proxy running on 127.0.0.1:8080
  Intercepting: api.openai.com -> creditswap.ai/openai
  Point your DNS or SDK to 127.0.0.1:8080
```

## How it works

1. You configure your SDK or application to point at `http://127.0.0.1:8080` instead of the original API host.
2. The proxy receives the request, rewrites the URL to `creditswap.ai/{platform}{path}`, and injects `Authorization: Bearer {key}`.
3. creditswap validates the key, deducts credits at the demand rate, and forwards the request to the original platform.
4. The response is streamed back to your application transparently.

## Test

```bash
cd proxy
go test -v ./...
```

## Options for directing traffic to the proxy

### Option A: Change the base URL in your SDK

Most AI SDKs let you set a custom base URL:

```python
# OpenAI Python SDK
import openai
openai.base_url = "http://127.0.0.1:8080/v1/"
```

```javascript
// OpenAI Node.js SDK
const openai = new OpenAI({ baseURL: "http://127.0.0.1:8080/v1/" })
```

### Option B: Modify `/etc/hosts` (system-wide)

Add this line to `/etc/hosts`:
```
127.0.0.1 api.openai.com
```

Now all requests to `api.openai.com` resolve to your local proxy. No SDK changes needed.

### Option C: Use a Docker sidecar

Run the proxy alongside your application in Docker Compose:
```yaml
services:
  proxy:
    build: ./proxy
    command: ["./creditswap-proxy", "--target", "api.openai.com", "--proxy-key", "${KEY}", "--platform", "openai"]
    ports: ["8080:8080"]
  app:
    depends_on: [proxy]
    environment:
      - OPENAI_BASE_URL=http://proxy:8080/v1/
```
