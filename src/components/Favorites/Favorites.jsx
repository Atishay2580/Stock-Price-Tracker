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
          <button className="btn-remove-all" onClick={removeAllFavorites}>
            Remove All
          </button>
          <div className="favorites-table-wrapper">
            <table className="favorites-table">
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {favorites.map((stock, index) => (
                  <tr key={stock.symbol} className="favorite-row">
                    <td>{index + 1}</td>
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
                    <td>${stock.marketCap || "N/A"}B</td>
                    <td>{stock.peRatio}</td>
                    <td>{stock.eps}</td>
                    <td>{stock.volume.toLocaleString()}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-remove-favorite"
                        onClick={() => removeFromFavorites(stock)}
                      >
                        Remove
                      </button>
                      <Link
                        to={`/favorites/Notification?symbol=${encodeURIComponent(
                          stock.symbol,
                        )}&price=${encodeURIComponent(stock.price)}&change=${encodeURIComponent(stock.change)}`}
                        className="btn-notification"
                      >
                        Notification
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="no-favorites-message">No favorites added yet.</p>
      )}
    </div>
  )
}

export default React.memo(Favorites)

