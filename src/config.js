export const config = {
  // Use environment variables if available, otherwise use fallback values
  // Note: In production, these should be set in your Netlify environment variables
  FINNHUB_API_KEY: import.meta.env.VITE_FINNHUB_API_KEY || "ctojcl1r01qpsuefpg8gctojcl1r01qpsuefpg90",
  NEWS_API_KEY: import.meta.env.VITE_NEWS_API_KEY || "895ed3941cc84f0093062d5b170d8088",
  TWELVE_DATA: import.meta.env.VITE_TWELVE_DATA_API_KEY || "a32393a257fb45ca95141d2525ad9ace",
  COINGECKO_API_KEY: import.meta.env.VITE_COINGECKO_API_KEY || "",
}

