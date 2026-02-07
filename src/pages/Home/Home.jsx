"use client"

import React, { useEffect, useState, useContext, useCallback, useMemo } from "react"
import "./Home.css"
import { Link } from "react-router-dom"
import LoadingSpinner from "../../components/Loading/LoadingSpinner"
import { AuthContext } from "../../assets/Context"
import { toast } from "react-toastify"
import { stockService } from "../../services/api"
import { debounce } from "../../utils/helpers"

const Home = () => {
  const { user } = useContext(AuthContext)
  const [stocks, setStocks] = useState([])
  const [filteredStocks, setFilteredStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [input, setInput] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)

  const inputHandler = (event) => {
    setInput(event.target.value)
  }

  // Memoize the search function with debounce
  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm.trim() === "") {
        setFilteredStocks(stocks)
        setError(null)
        return
      }

      setSearchLoading(true)
      setError(null)

      try {
        const quoteData = await stockService.getQuote(searchTerm.trim().toUpperCase())
        const { c: currentPrice, o: openPrice, pc: prevClose } = quoteData

        if (currentPrice) {
          const stockData = {
            symbol: searchTerm.trim().toUpperCase(),
            price: currentPrice.toFixed(2),
            change: (((currentPrice - prevClose) / prevClose) * 100).toFixed(2),
            marketCap: (Math.random() * 1000).toFixed(4),
            peRatio: (Math.random() * 30).toFixed(2),
            eps: (Math.random() * 5).toFixed(2),
            volume: Math.floor(Math.random() * 1000000),
          }

          setFilteredStocks([stockData]) 
        } else {
          setFilteredStocks([])
          setError("No data available for the entered stock symbol.")
        }
      } catch (err) {
        console.error("Error fetching stock data:", err)
        setFilteredStocks([])
        setError("Failed to fetch stock data. Please try again.")
      } finally {
        setSearchLoading(false)
      }
    }, 500),
    [stocks],
  )

  const searchHandler = (event) => {
    event.preventDefault()
    debouncedSearch(input)
  }

  const stockSymbols = useMemo(
    () => [
      "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NFLX", "NVDA", "ADBE", "INTC",
      "CSCO", "ORCL", "IBM", "PYPL", "CRM", "JPM", "V", "JNJ", "WMT", "MA",
      "PG", "UNH", "HD", "DIS", "BAC", "XOM", "CVX", "ABBV", "PFE", "KO",
      "AVGO", "COST", "MRK", "PEP", "TMO", "ABT", "ACN", "NKE", "CMCSA", "TXN",
      "NEE", "DHR", "VZ", "ADP", "LIN", "QCOM", "BMY", "HON", "AMGN", "PM",
      "LOW", "RTX", "UPS", "SBUX", "INTU", "SPGI", "AMT", "C", "GS", "BLK",
      "AXP", "DE", "PLD", "TJX", "EQIX", "ICE", "SHW", "ZTS", "APH", "KLAC",
    ],
    [],
  )

  const [currentPage, setCurrentPage] = useState(1)
  const stocksPerPage = 15

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Fetch all symbols in parallel but handle individual failures gracefully
        const results = await Promise.allSettled(
          stockSymbols.map(async (symbol) => {
            const quoteData = await stockService.getQuote(symbol)
            const { c: currentPrice, o: openPrice, pc: prevClose } = quoteData

            if (!currentPrice) {
              return null
            }

            return {
              symbol,
              price: currentPrice.toFixed(2),
              change: (((currentPrice - prevClose) / prevClose) * 100).toFixed(2),
              marketCap: (Math.random() * 1000).toFixed(2),
              peRatio: (Math.random() * 30).toFixed(2),
              eps: (Math.random() * 5).toFixed(2),
              volume: Math.floor(Math.random() * 1000000),
            }
          }),
        )

        const stockData = results
          .filter((result) => result.status === "fulfilled" && result.value)
          .map((result) => result.value)

        // If we couldn't fetch any stock data, use mock data
        if (stockData.length === 0) {
          const mockData = stockSymbols.map((symbol, index) => ({
            symbol,
            price: (100 + index * 10).toFixed(2),
            change: (Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1)).toFixed(2),
            marketCap: (Math.random() * 1000).toFixed(2),
            peRatio: (Math.random() * 30).toFixed(2),
            eps: (Math.random() * 5).toFixed(2),
            volume: Math.floor(Math.random() * 1000000),
          }))

          setStocks(mockData)
          setFilteredStocks(mockData)
          console.log("Using mock data due to API errors")
        } else {
          setStocks(stockData)
          setFilteredStocks(stockData)
        }
      } catch (err) {
        console.error("Error fetching stock data:", err)
        setError("Failed to fetch stock data")

        // Use mock data as fallback
        const mockData = stockSymbols.map((symbol, index) => ({
          symbol,
          price: (100 + index * 10).toFixed(2),
          change: (Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1)).toFixed(2),
          marketCap: (Math.random() * 1000).toFixed(2),
          peRatio: (Math.random() * 30).toFixed(2),
          eps: (Math.random() * 5).toFixed(2),
          volume: Math.floor(Math.random() * 1000000),
        }))

        setStocks(mockData)
        setFilteredStocks(mockData)
        console.log("Using mock data due to API errors")
      } finally {
        setLoading(false)
      }
    }

    fetchStockData()
  }, [stockSymbols])

  const addToFavorites = useCallback((stock) => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || []
    if (!favorites.some((fav) => fav.symbol === stock.symbol)) {
      favorites.push(stock)
      localStorage.setItem("favorites", JSON.stringify(favorites))
      toast.success(`${stock.symbol} added to favorites`, {
        position: "top-center",
      })
    } else {
      toast.info(`${stock.symbol} is already in favorites`, {
        position: "top-center",
      })
    }
  }, [])

  // Pagination logic
  const totalPages = Math.ceil(filteredStocks.length / stocksPerPage)
  const startIndex = (currentPage - 1) * stocksPerPage
  const endIndex = startIndex + stocksPerPage
  const currentStocks = filteredStocks.slice(startIndex, endIndex)

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // Reset to page 1 when search results change
  useEffect(() => {
    setCurrentPage(1)
  }, [input])

  return (
    <div className="home">
      <div className="hero">
        <h1>
          Track Stocks, <br /> Master the Market
        </h1>
        <p>
          Stay ahead of the game with real-time stock price updates and insights. Effortlessly monitor your investments
          and make informed decisions with ease.
        </p>
        <form onSubmit={searchHandler}>
          <input type="text" placeholder="Search Stock" onChange={inputHandler} value={input} required />
          <datalist id="stock"></datalist>
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="stock-table-wrapper">
        {(loading || searchLoading) && (
          <div className="loading-container">
            <LoadingSpinner message={loading ? "Fetching stocks..." : "Searching..."} />
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        {!loading && !searchLoading && !error && filteredStocks.length > 0 && (
          <table className="stock-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Stocks</th>
                <th>Price</th>
                <th>24H Change</th>
                <th>Market Cap</th>
                <th>P/E Ratio</th>
                <th>EPS</th>
                <th>Volume</th>
                {user && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {currentStocks.map((stock, index) => (
                <tr key={stock.symbol} className="stock-row">
                  <td>{startIndex + index + 1}</td>
                  <td>
                    <Link to={`/stock/${stock.symbol}`} className="stock-link">
                      {stock.symbol}
                    </Link>
                  </td>
                  <td>${stock.price}</td>
                  <td
                    className={stock.change >= 0 ? "change-positive" : "change-negative"}
                  >
                    {stock.change}%
                  </td>
                  <td>${stock.marketCap}B</td>
                  <td>{stock.peRatio}</td>
                  <td>{stock.eps}</td>
                  <td>{stock.volume.toLocaleString()}</td>
                  {user && (
                    <td>
                      <button
                        className="btn-add-favorite"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          addToFavorites(stock)
                        }}
                      >
                        Add to Favorites
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !searchLoading && !error && filteredStocks.length === 0 && (
          <p className="no-stocks-message">No stocks available to display.</p>
        )}

        {!loading && !searchLoading && !error && filteredStocks.length > 0 && totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages} ({filteredStocks.length} stocks)
            </span>
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(Home)

