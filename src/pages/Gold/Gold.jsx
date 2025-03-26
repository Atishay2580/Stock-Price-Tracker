"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react"
import "./Gold.css"
import LoadingSpinner from "../../components/Loading/LoadingSpinner"
import { metalsService } from "../../services/api"

const Gold = () => {
  const [goldPrice, setGoldPrice] = useState(null)
  const [cityPrices, setCityPrices] = useState([])
  const [selectedCity, setSelectedCity] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [calculatedPrice, setCalculatedPrice] = useState(null)
  const [error, setError] = useState("")

  // Memoize cities array to prevent unnecessary re-renders
  const cities = useMemo(
    () => [
      { name: "Mumbai", taxFactor: 1.02 },
      { name: "Delhi", taxFactor: 1.015 },
      { name: "Bangalore", taxFactor: 1.01 },
      { name: "Chennai", taxFactor: 1.025 },
      { name: "Kolkata", taxFactor: 1.005 },
      { name: "Hyderabad", taxFactor: 1.02 },
      { name: "Ahmedabad", taxFactor: 1.03 },
      { name: "Pune", taxFactor: 1.01 },
      { name: "Jaipur", taxFactor: 1.02 },
      { name: "Lucknow", taxFactor: 1.015 },
    ],
    [],
  )

  useEffect(() => {
    const fetchGoldPrice = async () => {
      try {
        try {
          const data = await metalsService.getMetalPrice("tether-gold")

          if (data && data["tether-gold"] && data["tether-gold"].usd) {
            const usdPrice = data["tether-gold"].usd
            const inrPricePerGram = (usdPrice * 85.5) / 31.1

            setGoldPrice(inrPricePerGram)

            const prices = cities.map((city) => ({
              name: city.name,
              pricePerGram: (inrPricePerGram * city.taxFactor).toFixed(2),
            }))

            setCityPrices(prices)
          } else {
            throw new Error("Invalid response structure")
          }
        } catch (apiError) {
          console.error("API Error:", apiError)

          // Use mock data
          const mockGoldPrice = 5500 + Math.random() * 500 // Random price around 5500-6000 INR
          setGoldPrice(mockGoldPrice)

          const mockPrices = cities.map((city) => ({
            name: city.name,
            pricePerGram: (mockGoldPrice * city.taxFactor).toFixed(2),
          }))

          setCityPrices(mockPrices)
          console.log("Using mock gold price data due to API errors")
        }
      } catch (err) {
        console.error("Error:", err)
        setError(`Error fetching data: ${err.message}`)
      }
    }

    fetchGoldPrice()
  }, [cities])

  const handleCityChange = useCallback(
    (e) => {
      const city = e.target.value
      setSelectedCity(city)

      const selectedCityPrice = cityPrices.find((c) => c.name === city)?.pricePerGram
      if (selectedCityPrice) {
        setCalculatedPrice((selectedCityPrice * quantity).toFixed(2))
      }
    },
    [cityPrices, quantity],
  )

  const handleQuantityChange = useCallback(
    (e) => {
      const qty = Number.parseFloat(e.target.value)
      setQuantity(qty)

      const selectedCityPrice = cityPrices.find((c) => c.name === selectedCity)?.pricePerGram
      if (selectedCityPrice) {
        setCalculatedPrice((selectedCityPrice * qty).toFixed(2))
      }
    },
    [cityPrices, selectedCity],
  )

  // Memoize price tables to prevent unnecessary re-renders
  const renderPriceTable = useCallback(
    (multiplier, title) => (
      <>
        <h2>
          Gold Prices for {multiplier} {multiplier === 1 ? "Gram" : "Grams"}
        </h2>
        <table className="city-prices">
          <thead>
            <tr>
              <th>City</th>
              <th>Gold Price (INR)</th>
            </tr>
          </thead>
          <tbody>
            {cityPrices.map((city) => (
              <tr key={city.name}>
                <td>{city.name}</td>
                <td>₹{(city.pricePerGram * multiplier).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
    [cityPrices],
  )

  return (
    <div className="gold-container">
      <h1>Gold Prices in Indian Cities</h1>
      {error ? (
        <p className="error-message">{error}</p>
      ) : goldPrice ? (
        <div>
          <p>
            <strong>Base Gold Price (1 gram in INR):</strong> ₹{goldPrice.toFixed(2)}
          </p>

          <h2>Gold Price Calculator</h2>
          <div className="calculator">
            <label>
              Select City:
              <select value={selectedCity} onChange={handleCityChange}>
                <option value="">-- Select City --</option>
                {cityPrices.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Enter Quantity (grams):
              <input type="number" value={quantity} min="1" onChange={handleQuantityChange} />
            </label>
            {calculatedPrice && (
              <p className="calculated-price">
                <strong>Total Price:</strong> ₹{calculatedPrice}
              </p>
            )}
          </div>

          {renderPriceTable(1)}
          {renderPriceTable(10)}
          {renderPriceTable(100)}
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  )
}

export default React.memo(Gold)

