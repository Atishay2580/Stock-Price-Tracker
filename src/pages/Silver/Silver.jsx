"use client"

import { useEffect, useState } from "react"
import "./Silver.css"
import LoadingSpinner from "../../components/Loading/LoadingSpinner"

const Silver = () => {
  const [silverPrice, setSilverPrice] = useState(null)
  const [cityPrices, setCityPrices] = useState([])
  const [selectedCity, setSelectedCity] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [calculatedPrice, setCalculatedPrice] = useState(null)
  const [error, setError] = useState("")

  const apiKey = "CG-GBhigMt2LcyNX8uA9TUb45JP"
  const cities = [
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
  ]

  useEffect(() => {
    const fetchSilverPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=gram-silver&vs_currencies=usd",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          },
        )

        if (!response.ok) {
          throw new Error("Failed to fetch")
        }

        const data = await response.json()
        if (data && data["gram-silver"] && data["gram-silver"].usd) {
          const usdPrice = data["gram-silver"].usd

          const inrPricePerGram = usdPrice * 85.5

          setSilverPrice(inrPricePerGram)

          const prices = cities.map((city) => ({
            name: city.name,
            pricePerGram: (inrPricePerGram * city.taxFactor).toFixed(2),
          }))

          setCityPrices(prices)
        } else {
          throw new Error("Invalid response structure")
        }
      } catch (err) {
        console.error("Error:", err)
        setError(`Error fetching data: ${err.message}`)
      }
    }

    fetchSilverPrice()
  }, [])

  const handleCityChange = (e) => {
    const city = e.target.value
    setSelectedCity(city)

    const selectedCityPrice = cityPrices.find((c) => c.name === city)?.pricePerGram
    if (selectedCityPrice) {
      setCalculatedPrice((selectedCityPrice * quantity).toFixed(2))
    }
  }

  const handleQuantityChange = (e) => {
    const qty = Number.parseFloat(e.target.value)
    setQuantity(qty)

    const selectedCityPrice = cityPrices.find((c) => c.name === selectedCity)?.pricePerGram
    if (selectedCityPrice) {
      setCalculatedPrice((selectedCityPrice * qty).toFixed(2))
    }
  }

  return (
    <div className="silver-container">
      <h1>Silver Prices in Indian Cities</h1>
      {error ? (
        <p className="error-message">{error}</p>
      ) : silverPrice ? (
        <div>
          <p>
            <strong>Base Silver Price (1 gram in INR):</strong> ₹{silverPrice.toFixed(2)}
          </p>

          <h2>Silver Price Calculator</h2>
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

          <h2>Silver Prices for 1 Gram</h2>
          <table className="city-prices">
            <thead>
              <tr>
                <th>City</th>
                <th>Silver Price (INR)</th>
              </tr>
            </thead>
            <tbody>
              {cityPrices.map((city) => (
                <tr key={city.name}>
                  <td>{city.name}</td>
                  <td>₹{city.pricePerGram}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Silver Prices for 10 Grams</h2>
          <table className="city-prices">
            <thead>
              <tr>
                <th>City</th>
                <th>Silver Price (INR)</th>
              </tr>
            </thead>
            <tbody>
              {cityPrices.map((city) => (
                <tr key={city.name}>
                  <td>{city.name}</td>
                  <td>₹{(city.pricePerGram * 10).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Silver Prices for 100 Grams</h2>
          <table className="city-prices">
            <thead>
              <tr>
                <th>City</th>
                <th>Silver Price (INR)</th>
              </tr>
            </thead>
            <tbody>
              {cityPrices.map((city) => (
                <tr key={city.name}>
                  <td>{city.name}</td>
                  <td>₹{(city.pricePerGram * 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>
          <LoadingSpinner />
        </p>
      )}
    </div>
  )
}

export default Silver

