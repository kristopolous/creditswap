package main

import (
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
)

func main() {
	port := flag.Int("port", 8080, "local port to listen on")
	target := flag.String("target", "", "original API host (e.g. api.cloudify.com)")
	proxyKey := flag.String("proxy-key", "", "creditswap proxy key")
	platform := flag.String("platform", "", "platform slug (e.g. cloudify)")
	flag.Parse()

	if *target == "" || *proxyKey == "" || *platform == "" {
		fmt.Fprintln(os.Stderr, "Usage: creditswap-proxy --target <api-host> --proxy-key <key> --platform <slug>")
		fmt.Fprintln(os.Stderr, "  --target     Original API host to intercept (e.g. api.cloudify.com)")
		fmt.Fprintln(os.Stderr, "  --proxy-key  Your creditswap.ai proxy key")
		fmt.Fprintln(os.Stderr, "  --platform   Platform slug (e.g. cloudify)")
		fmt.Fprintln(os.Stderr, "  --port       Local port (default 8080)")
		os.Exit(1)
	}

	proxy := &creditswapProxy{
		targetHost:  *target,
		proxyKey:    *proxyKey,
		platform:    *platform,
		upstream:    fmt.Sprintf("https://creditswap.ai/%s", strings.TrimLeft(*platform, "/")),
	}

	handler := http.HandlerFunc(proxy.serve)

	ln, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", *port))
	if err != nil {
		log.Fatalf("Failed to listen on port %d: %v", *port, err)
	}

	server := &http.Server{Handler: handler}

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sig
		log.Println("Shutting down...")
		server.Close()
	}()

	fmt.Printf("creditswap proxy running on 127.0.0.1:%d\n", *port)
	fmt.Printf("  Intercepting: %s -> creditswap.ai/%s\n", *target, *platform)
	fmt.Printf("  Point your DNS or SDK to 127.0.0.1:%d\n", *port)
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
