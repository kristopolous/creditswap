package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestProxyForwardsRequest(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" {
			t.Errorf("expected GET, got %s", r.Method)
		}
		if r.URL.Path != "/v1/chat/completions" {
			t.Errorf("expected /v1/chat/completions, got %s", r.URL.Path)
		}
		if r.Header.Get("Authorization") != "Bearer csw_test_key" {
			t.Errorf("expected Bearer csw_test_key, got %s", r.Header.Get("Authorization"))
		}
		if r.Header.Get("X-Custom") != "value" {
			t.Errorf("expected X-Custom: value, got %s", r.Header.Get("X-Custom"))
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		io.WriteString(w, `{"choices":[{"text":"hello"}]}`)
	}))
	defer upstream.Close()

	proxy := &creditswapProxy{
		targetHost: "api.test.com",
		proxyKey:   "csw_test_key",
		platform:   "test-platform",
		upstream:   upstream.URL,
	}

	proxyServer := httptest.NewServer(http.HandlerFunc(proxy.serve))
	defer proxyServer.Close()

	req, _ := http.NewRequest("GET", proxyServer.URL+"/v1/chat/completions", nil)
	req.Header.Set("X-Custom", "value")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
	if resp.Header.Get("Content-Type") != "application/json" {
		t.Errorf("expected application/json, got %s", resp.Header.Get("Content-Type"))
	}
	if !strings.Contains(string(body), "hello") {
		t.Errorf("expected response body to contain 'hello', got %s", body)
	}
}

func TestProxyForwardsQueryParams(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.RawQuery != "model=gpt-4&stream=true" {
			t.Errorf("expected query params, got %s", r.URL.RawQuery)
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()

	proxy := &creditswapProxy{
		targetHost: "api.test.com",
		proxyKey:   "key",
		platform:   "test",
		upstream:   upstream.URL,
	}

	proxyServer := httptest.NewServer(http.HandlerFunc(proxy.serve))
	defer proxyServer.Close()

	resp, _ := http.Get(proxyServer.URL + "/v1/completions?model=gpt-4&stream=true")
	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
}

func TestProxyPostBody(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		if !strings.Contains(string(body), `"prompt":"hello"`) {
			t.Errorf("unexpected body: %s", body)
		}
		w.WriteHeader(http.StatusOK)
		io.WriteString(w, `{"ok":true}`)
	}))
	defer upstream.Close()

	proxy := &creditswapProxy{
		targetHost: "api.test.com",
		proxyKey:   "key",
		platform:   "test",
		upstream:   upstream.URL,
	}

	proxyServer := httptest.NewServer(http.HandlerFunc(proxy.serve))
	defer proxyServer.Close()

	body := strings.NewReader(`{"prompt":"hello","max_tokens":100}`)
	resp, err := http.Post(proxyServer.URL+"/v1/completions", "application/json", body)
	if err != nil {
		t.Fatalf("POST failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
}

func TestProxyRemovesOriginalHost(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Host") == "api.test.com" {
			t.Error("original Host header should not be forwarded")
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()

	proxy := &creditswapProxy{
		targetHost: "api.test.com",
		proxyKey:   "key",
		platform:   "test",
		upstream:   upstream.URL,
	}

	proxyServer := httptest.NewServer(http.HandlerFunc(proxy.serve))
	defer proxyServer.Close()

	req, _ := http.NewRequest("GET", proxyServer.URL+"/v1/models", nil)
	req.Host = "api.test.com"
	http.DefaultClient.Do(req)
}

func TestProxyHandlesUpstreamError(t *testing.T) {
	proxy := &creditswapProxy{
		targetHost: "api.test.com",
		proxyKey:   "key",
		platform:   "test",
		upstream:   "http://127.0.0.1:1", // refuse connection
	}

	proxyServer := httptest.NewServer(http.HandlerFunc(proxy.serve))
	defer proxyServer.Close()

	resp, _ := http.Get(proxyServer.URL + "/v1/models")
	if resp.StatusCode != http.StatusBadGateway {
		t.Errorf("expected 502, got %d", resp.StatusCode)
	}
}

func TestHostHeaderSetToUpstream(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Host == "" {
			t.Error("Host header should not be empty")
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()

	proxy := &creditswapProxy{
		targetHost: "api.test.com",
		proxyKey:   "key",
		platform:   "test",
		upstream:   upstream.URL,
	}

	proxyServer := httptest.NewServer(http.HandlerFunc(proxy.serve))
	defer proxyServer.Close()

	resp, _ := http.Get(proxyServer.URL + "/v1/models")
	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
}
