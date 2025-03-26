"use client"

import React, { useEffect, useState, useCallback } from "react"
import { toast } from "react-toastify"
import "./Favorites.css"
import { Link } from "react-router-dom"

const Favorites = () => {
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || []
    setFavorites(storedFavorites)
  }, [])

  const removeFromFavorites = useCallback(
    (stock) => {
      const updatedFavorites = favorites.filter((fav) => fav.symbol !== stock.symbol)
      setFavorites(updatedFavorites)
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
      toast.info(`${stock.symbol} removed from favorites`, {
        position: "top-center",
      })
    },
    [favorites],
  )

  const removeAllFavorites = useCallback(() => {
    setFavorites([])
    localStorage.removeItem("favorites")
    toast.info("All favorites removed", {
      position: "top-center",
    })
  }, [])

  return (
    <div className="favorites">
      <h1>Your Favorites</h1>
      {favorites.length > 0 ? (
        <div>
          <button onClick={removeAllFavorites}>Remove All</button>
          <div className="stock-table">
            <div className="table-layout header">
              <p>#</p>
              <p>Stocks</p>
              <p>Price</p>
              <p style={{ textAlign: "center" }}>24H Change</p>
              <p>P/E Ratio</p>
              <p>EPS</p>
              <p>Volume</p>
              <p>Action - 1</p>
              <p>Action - 2</p>
            </div>
            {favorites.map((stock, index) => (
              <div key={stock.symbol} className="table-layout row">
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
                <p>{stock.peRatio}</p>
                <p>{stock.eps}</p>
                <p>{stock.volume.toLocaleString()}</p>
                <button className="btn-remove-favorite" onClick={() => removeFromFavorites(stock)}>
                  Remove
                </button>
                <button>
                  <Link
                    to={`/favorites/Notification?symbol=${encodeURIComponent(
                      stock.symbol,
                    )}&price=${encodeURIComponent(stock.price)}&change=${encodeURIComponent(stock.change)}`}
                  >
                    Notification
                  </Link>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No favorites added yet.</p>
      )}
    </div>
  )
}

export default React.memo(Favorites)

