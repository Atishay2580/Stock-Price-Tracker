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
      "AAPL",
      "MSFT",
      "GOOGL",
      "AMZN",
      "TSLA",
      "META",
      "NFLX",
      "NVDA",
      "ADBE",
      "INTC",
      "CSCO",
      "ORCL",
      "IBM",
      "PYPL",
      "CRM",
    ],
    [],
  )

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Create an array to store successfully fetched stock data
        const stockData = []

        // Use a for...of loop instead of Promise.all to handle individual errors
        for (const symbol of stockSymbols) {
          try {
            const quoteData = await stockService.getQuote(symbol)
            const { c: currentPrice, o: openPrice, pc: prevClose } = quoteData

            if (currentPrice) {
              stockData.push({
                symbol,
                price: currentPrice.toFixed(2),
                change: (((currentPrice - prevClose) / prevClose) * 100).toFixed(2),
                marketCap: (Math.random() * 1000).toFixed(2),
                peRatio: (Math.random() * 30).toFixed(2),
                eps: (Math.random() * 5).toFixed(2),
                volume: Math.floor(Math.random() * 1000000),
              })
            }
          } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error)
            // Continue with the next symbol instead of failing completely
          }
        }

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

      <div className="stock-table">
        <div className="table-layout header">
          <p>#</p>
          <p>Stocks</p>
          <p>Price</p>
          <p style={{ textAlign: "center" }}>24H Change</p>
          <p className="market-cap">Market Cap</p>
          <p>P/E Ratio</p>
          <p>EPS</p>
          <p>Volume</p>
        </div>

        {(loading || searchLoading) && <LoadingSpinner />}

        {error && <p>{error}</p>}

        {!loading && !searchLoading && !error && filteredStocks.length > 0
          ? filteredStocks.map((stock, index) => (
              <div key={stock.symbol}>
                <Link to={`/stock/${stock.symbol}`} className="stock-row-link">
                  <div className="table-layout row">
                    <p>{index + 1}</p>
                    <p>{stock.symbol}</p>
                    <p>${stock.price}</p>
                    <p
                      style={{
                        textAlign: "center",
                        color: stock.change >= 0 ? "green" : "red",
                      }}
                    >
                      {stock.change}%
                    </p>
                    <p className="market-cap">${stock.marketCap}B</p>
                    <p>{stock.peRatio}</p>
                    <p>{stock.eps}</p>
                    <p>{stock.volume.toLocaleString()}</p>
                  </div>
                </Link>
                {user && (
                  <button className="btn-add-favorite" onClick={() => addToFavorites(stock)}>
                    Add to Favorites
                  </button>
                )}
              </div>
            ))
          : !loading && !searchLoading && <p>No stocks available to display.</p>}
      </div>
    </div>
  )
}

export default React.memo(Home)

