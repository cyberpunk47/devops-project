package main

import (
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

// ─── Config ────────────────────────────────────────────────
const (
	baseURL        = "http://localhost:8000"
	totalRequests  = 200
	concurrency    = 10
	delayBetween   = 50 * time.Millisecond
)

// ─── Counters ──────────────────────────────────────────────
var (
	successCount int64
	failCount    int64
)

func main() {
	fmt.Println("🚀 Traffic Generator — DevOps Demo")
	fmt.Printf("   Target:      %s\n", baseURL)
	fmt.Printf("   Requests:    %d\n", totalRequests)
	fmt.Printf("   Concurrency: %d\n\n", concurrency)

	client := &http.Client{Timeout: 5 * time.Second}
	var wg sync.WaitGroup
	sem := make(chan struct{}, concurrency)

	start := time.Now()

	for i := 0; i < totalRequests; i++ {
		wg.Add(1)
		sem <- struct{}{}
		go func(n int) {
			defer wg.Done()
			defer func() { <-sem }()
			sendRequest(client, n)
			time.Sleep(delayBetween)
		}(i)
	}

	wg.Wait()
	elapsed := time.Since(start)

	fmt.Println("\n────────────────────────────────────")
	fmt.Printf("✅ Success: %d\n", atomic.LoadInt64(&successCount))
	fmt.Printf("❌ Failed:  %d\n", atomic.LoadInt64(&failCount))
	fmt.Printf("⏱  Elapsed: %s\n", elapsed.Round(time.Millisecond))
	fmt.Printf("📊 RPS:     %.1f\n", float64(totalRequests)/elapsed.Seconds())
	fmt.Println("────────────────────────────────────")
	fmt.Println("\n👉 Check dashboards:")
	fmt.Println("   Prometheus → http://localhost:9090")
	fmt.Println("   Grafana    → http://localhost:3001  (admin / admin)")
}

func sendRequest(client *http.Client, n int) {
	// Randomly pick an action
	actions := []string{"GET", "POST", "GET", "GET"} // heavier on reads
	action := actions[rand.Intn(len(actions))]

	var resp *http.Response
	var err error

	switch action {
	case "POST":
		body := fmt.Sprintf(`{"title":"task-%d","description":"auto generated","completed":false}`, n)
		resp, err = client.Post(baseURL+"/tasks", "application/json", strings.NewReader(body))
	default:
		resp, err = client.Get(baseURL + "/tasks")
	}

	if err != nil {
		atomic.AddInt64(&failCount, 1)
		fmt.Printf("  [%3d] %-4s ❌ %v\n", n, action, err)
		return
	}
	resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		atomic.AddInt64(&successCount, 1)
		fmt.Printf("  [%3d] %-4s ✅ %d\n", n, action, resp.StatusCode)
	} else {
		atomic.AddInt64(&failCount, 1)
		fmt.Printf("  [%3d] %-4s ❌ %d\n", n, action, resp.StatusCode)
	}
}
