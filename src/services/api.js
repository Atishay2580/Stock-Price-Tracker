import axios from "axios"

// Determine if we're in development or production
const isDevelopment = import.meta.env.DEV

// Helper function to handle API calls
const callApi = async (endpoint, data) => {
  try {
    if (isDevelopment) {
      // In development, use direct API calls with the Vite proxy
      switch (endpoint) {
        case "finnhub": {
          const { endpoint: finnhubEndpoint, symbol } = data
          const response = await axios.get(`/api/finnhub/${finnhubEndpoint}`, {
            params: {
              symbol,
              token: import.meta.env.VITE_FINNHUB_API_KEY || "ctojcl1r01qpsuefpg8gctojcl1r01qpsuefpg90",
            },
          })
          return response.data
        }
        case "news": {
          const { query, page } = data
          const response = await axios.get(`/api/news`, {
            params: {
              q: query,
              sortBy: "publishedAt",
              pageSize: 12,
              page,
              apiKey: import.meta.env.VITE_NEWS_API_KEY || "895ed3941cc84f0093062d5b170d8088",
            },
          })
          return response.data
        }
        case "metals": {
          const { metal } = data
          const response = await axios.get(`/api/metals`, {
            params: {
              ids: metal,
              vs_currencies: "usd",
            },
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_COINGECKO_API_KEY || ""}`,
            },
          })
          return response.data
        }
        case "chart": {
          const { symbol } = data
          const response = await axios.get(`/api/chart`, {
            params: {
              symbol,
              interval: "1day",
              apikey: import.meta.env.VITE_TWELVE_DATA_API_KEY || "a32393a257fb45ca95141d2525ad9ace",
              outputsize: "100",
            },
          })
          return response.data
        }
        default:
          throw new Error(`Unknown API endpoint: ${endpoint}`)
      }
    } else {
      // In production, use Vercel API routes
      const response = await axios.post(`/api/${endpoint}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      return response.data
    }
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error)
    throw error
  }
}

// Cache for storing API responses
const cache = {
  data: {},
  timestamp: {},
  // Cache expiration in milliseconds (5 minutes)
  expirationTime: 5 * 60 * 1000,

  // Get cached data if it exists and is not expired
  get(key) {
    const now = Date.now()
    if (this.data[key] && now - this.timestamp[key] < this.expirationTime) {
      return this.data[key]
    }
    return null
  },

  // Set data in cache with current timestamp
  set(key, data) {
    this.data[key] = data
    this.timestamp[key] = Date.now()
  },
}

// Stock API services
export const stockService = {
  // Get stock quote
  async getQuote(symbol) {
    const cacheKey = `quote_${symbol}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return cachedData
    }

    const data = await callApi("finnhub", {
      endpoint: "quote",
      symbol,
    })

    cache.set(cacheKey, data)
    return data
  },

  // Get company profile
  async getCompanyProfile(symbol) {
    const cacheKey = `profile_${symbol}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return cachedData
    }

    const data = await callApi("finnhub", {
      endpoint: "stock/profile2",
      symbol,
    })

    cache.set(cacheKey, data)
    return data
  },
}

// News API service
export const newsService = {
  async getNews(query = "stocks", page = 1) {
    const cacheKey = `news_${query}_${page}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return cachedData
    }

    const data = await callApi("news", { query, page })

    cache.set(cacheKey, data)
    return data
  },
}

// Metals API service
export const metalsService = {
  async getMetalPrice(metal) {
    const cacheKey = `metal_${metal}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return cachedData
    }

    const data = await callApi("metals", { metal })

    cache.set(cacheKey, data)
    return data
  },
}

// Chart data service
export const chartService = {
  async getChartData(symbol) {
    const cacheKey = `chart_${symbol}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return cachedData
    }

    const data = await callApi("chart", { symbol })

    cache.set(cacheKey, data)
    return data
  },
}

