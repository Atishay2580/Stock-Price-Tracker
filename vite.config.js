import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests during development
      "/api/finnhub": {
        target: "https://finnhub.io/api/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/finnhub/, ""),
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err)
          })
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url)
          })
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url)
          })
        },
      },
      "/api/news": {
        target: "https://newsapi.org/v2/everything",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/news/, ""),
      },
      "/api/metals": {
        target: "https://api.coingecko.com/api/v3/simple/price",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/metals/, ""),
      },
      "/api/chart": {
        target: "https://api.twelvedata.com/time_series",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chart/, ""),
      },
    },
  },
})

