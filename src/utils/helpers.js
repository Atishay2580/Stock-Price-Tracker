// Debounce function to limit how often a function can be called
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Format large numbers with commas
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// Calculate percentage change
export const calculatePercentChange = (current, previous) => {
  return (((current - previous) / previous) * 100).toFixed(2)
}

// Generate mock data for fallback
export const generateMockStockData = (symbol) => {
  return {
    symbol,
    price: (Math.random() * 500 + 50).toFixed(2),
    change: (Math.random() * 10 - 5).toFixed(2),
    marketCap: (Math.random() * 1000).toFixed(2),
    peRatio: (Math.random() * 30).toFixed(2),
    eps: (Math.random() * 5).toFixed(2),
    volume: Math.floor(Math.random() * 1000000),
  }
}

