"use client"

import { useState } from "react"
import { useLocation } from "react-router-dom"
import "./Notification.css"

const Notification = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const [percentage, setPercentage] = useState("")
  const [priceChange, setPriceChange] = useState("")

  // Extract stock details from query parameters
  const stockDetails = {
    symbol: queryParams.get("symbol") || "N/A",
    price: queryParams.get("price") || "N/A",
    change: queryParams.get("change") || "N/A",
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (percentage || priceChange) {
      alert(`Notification set for ${percentage}% and price change of $${priceChange}`)
      setPercentage("")
      setPriceChange("")
    } else {
      alert("Please fill atleast one field!")
    }
  }

  return (
    <div className="notification-container">
      <div className="stock-details">
        <h2>Stock Details</h2>
        <p>
          <strong>Symbol:</strong> {stockDetails.symbol}
        </p>
        <p>
          <strong>Price:</strong> ${stockDetails.price}
        </p>
        <p>
          <strong>Change:</strong> {stockDetails.change}
        </p>
      </div>
      <div className="warn-me-form">
        <h2>Warn Me</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Percentage (%):
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="Enter percentage"
            />
          </label>
          <label>
            Change in Price ($):
            <input
              type="number"
              value={priceChange}
              onChange={(e) => setPriceChange(e.target.value)}
              placeholder="Enter price change"
            />
          </label>
          <button type="submit">Set Notification</button>
        </form>
      </div>
    </div>
  )
}

export default Notification

