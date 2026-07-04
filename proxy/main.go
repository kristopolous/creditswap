package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
)

type authStartResponse struct {
	Code           string `json:"code"`
	VerificationUrl string `json:"verificationUrl"`
	ExpiresIn      int    `json:"expiresIn"`
}

type authStatusResponse struct {
	Status       string `json:"status"`
	ProxyKey     string `json:"proxyKey"`
	PlatformSlug string `json:"platformSlug"`
	TargetHost   string `json:"targetHost"`
}

func main() {
	port := flag.Int("port", 8080, "local port to listen on")
	target := flag.String("target", "", "original API host (e.g. api.cloudify.com)")
	proxyKey := flag.String("proxy-key", "", "creditswap proxy key")
	platform := flag.String("platform", "", "platform slug (e.g. cloudify)")
	authMode := flag.Bool("auth", false, "authenticate via browser instead of providing --proxy-key")
	server := flag.String("server", "https://creditswap.ai", "creditswap server URL")
	flag.Parse()

	if *authMode {
		runAuthFlow(*port, *server)
		return
	}

	if *target == "" || *proxyKey == "" || *platform == "" {
		fmt.Fprintln(os.Stderr, "Usage: creditswap-proxy --target <api-host> --proxy-key <key> --platform <slug>")
		fmt.Fprintln(os.Stderr, "       creditswap-proxy --auth")
		fmt.Fprintln(os.Stderr, "")
		fmt.Fprintln(os.Stderr, "  --target     Original API host to intercept (e.g. api.cloudify.com)")
		fmt.Fprintln(os.Stderr, "  --proxy-key  Your creditswap.ai proxy key")
		fmt.Fprintln(os.Stderr, "  --platform   Platform slug (e.g. cloudify)")
		fmt.Fprintln(os.Stderr, "  --port       Local port (default 8080)")
		fmt.Fprintln(os.Stderr, "  --auth       Authenticate via browser instead of flags")
		fmt.Fprintln(os.Stderr, "  --server     Creditswap server URL (default https://creditswap.ai)")
		os.Exit(1)
	}

	startProxy(*port, *target, *proxyKey, *platform, *server)
}

func runAuthFlow(port int, serverURL string) {
	fmt.Println("creditswap proxy — browser authentication")
	fmt.Println("")

	client := &http.Client{Timeout: 10 * time.Second}

	// Step 1: request a device code
	resp, err := client.Post(serverURL+"/api/v1/proxy/auth/start", "application/json", nil)
	if err != nil {
		log.Fatalf("Failed to contact server: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		log.Fatalf("Server returned %d: %s", resp.StatusCode, string(body))
	}

	var authResp authStartResponse
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		log.Fatalf("Failed to decode server response: %v", err)
	}

	// Step 2: print the verification URL
	fmt.Println("┌─────────────────────────────────────────────────────┐")
	fmt.Println("│  Open this URL in your browser to authenticate:     │")
	fmt.Println("│                                                     │")
	fmt.Printf("│  %-51s │\n", authResp.VerificationUrl)
	fmt.Println("│                                                     │")
	fmt.Printf("│  Session code: %-38s │\n", authResp.Code)
	fmt.Println("│                                                     │")
	fmt.Println("│  The link expires in 10 minutes.                    │")
	fmt.Println("└─────────────────────────────────────────────────────┘")
	fmt.Println("")
	fmt.Print("Waiting for authentication")

	// Step 3: poll for status every 3 seconds
	statusURL := serverURL + "/api/v1/proxy/auth/status?code=" + url.QueryEscape(authResp.Code)
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	timeout := time.After(10 * time.Minute)

	for {
		select {
		case <-ticker.C:
			fmt.Print(".")
			resp, err := client.Get(statusURL)
			if err != nil {
				continue
			}
			var statusResp authStatusResponse
			if err := json.NewDecoder(resp.Body).Decode(&statusResp); err != nil {
				resp.Body.Close()
				continue
			}
			resp.Body.Close()

			if statusResp.Status == "active" {
				fmt.Println("")
				fmt.Println("")
				fmt.Println("✓ Authenticated!")
				fmt.Println("")
				fmt.Printf("  Platform:     %s\n", statusResp.PlatformSlug)
				fmt.Printf("  Target:       %s\n", statusResp.TargetHost)
				fmt.Printf("  Proxy key:    %s\n", statusResp.ProxyKey)
				fmt.Println("")
				startProxy(port, statusResp.TargetHost, statusResp.ProxyKey, statusResp.PlatformSlug, serverURL)
				return
			}

		case <-timeout:
			fmt.Println("")
			log.Fatalf("Authentication timed out after 10 minutes")
		}
	}
}

func startProxy(port int, targetHost, proxyKey, platform, serverURL string) {
	upstream := fmt.Sprintf("%s/%s", strings.TrimRight(serverURL, "/"), strings.TrimLeft(platform, "/"))

	proxy := &creditswapProxy{
		targetHost: targetHost,
		proxyKey:   proxyKey,
		platform:   platform,
		upstream:   upstream,
	}

	handler := http.HandlerFunc(proxy.serve)

	ln, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", port))
	if err != nil {
		log.Fatalf("Failed to listen on port %d: %v", port, err)
	}

	server := &http.Server{Handler: handler}

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sig
		log.Println("Shutting down...")
		server.Close()
	}()

	fmt.Printf("creditswap proxy running on 127.0.0.1:%d\n", port)
	fmt.Printf("  Intercepting: %s -> %s/%s\n", targetHost, serverURL, platform)
	fmt.Printf("  Point your DNS or SDK to 127.0.0.1:%d\n", port)
	fmt.Println("  Press Ctrl+C to stop.")

	if err := server.Serve(ln); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}

type creditswapProxy struct {
	targetHost string
	proxyKey   string
	platform   string
	upstream   string
}

func (p *creditswapProxy) serve(w http.ResponseWriter, r *http.Request) {
	upstreamURL, err := url.Parse(p.upstream)
	if err != nil {
		http.Error(w, "bad upstream", http.StatusInternalServerError)
		return
	}

	proxyURL := fmt.Sprintf("%s%s", strings.TrimRight(p.upstream, "/"), r.URL.Path)
	if r.URL.RawQuery != "" {
		proxyURL += "?" + r.URL.RawQuery
	}

	proxyReq, err := http.NewRequestWithContext(r.Context(), r.Method, proxyURL, r.Body)
	if err != nil {
		http.Error(w, "failed to create request", http.StatusInternalServerError)
		return
	}

	proxyReq.Header.Set("Authorization", "Bearer "+p.proxyKey)
	proxyReq.Header.Set("Host", upstreamURL.Host)

	for key, vals := range r.Header {
		if key == "Host" || key == "Authorization" {
			continue
		}
		for _, v := range vals {
			proxyReq.Header.Add(key, v)
		}
	}

	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		log.Printf("ERROR: %s %s -> %v", r.Method, r.URL.Path, err)
		http.Error(w, "upstream request failed", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	for key, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(key, v)
		}
	}
	w.WriteHeader(resp.StatusCode)

	written, err := io.Copy(w, resp.Body)
	if err != nil {
		log.Printf("ERROR: response copy failed after %d bytes: %v", written, err)
	}

	log.Printf("%s %s -> %s [%d]", r.Method, r.URL.Path, proxyURL, resp.StatusCode)
}
