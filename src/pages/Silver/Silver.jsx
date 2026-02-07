"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import "./Silver.css"
import LoadingSpinner from "../../components/Loading/LoadingSpinner"
import { metalsService } from "../../services/api"
import { toast } from "react-toastify"

const Silver = () => {
  const [silverPrice, setSilverPrice] = useState(90) // Default fallback price
  const [cityPrices, setCityPrices] = useState([])
  const [selectedCity, setSelectedCity] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [calculatedPrice, setCalculatedPrice] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

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
    const fetchSilverPrice = async () => {
      try {
        setLoading(true)
        setError("")
        
        let usdPricePerOunce = null
        let apiSuccess = false

        // Try multiple approaches to get silver price
        const silverIds = ["xag", "silver"]
        
        for (const silverId of silverIds) {
          try {
            console.log(`Attempting to fetch silver price with ID: ${silverId}`)
            const data = await metalsService.getMetalPrice(silverId)
            console.log(`Silver API Response for ${silverId}:`, JSON.stringify(data, null, 2))
            
            // Check various response formats
            if (data && typeof data === "object") {
              // Format 1: { xag: { usd: 25.5 } }
              if (data[silverId] && typeof data[silverId].usd === "number" && data[silverId].usd > 0) {
                usdPricePerOunce = data[silverId].usd
                apiSuccess = true
                console.log(`Found price in format 1: $${usdPricePerOunce} per ounce`)
                break
              }
              
              // Format 2: { silver: { usd: 25.5 } }
              const keys = Object.keys(data)
              for (const key of keys) {
                if (data[key] && typeof data[key] === "object" && typeof data[key].usd === "number" && data[key].usd > 0) {
                  usdPricePerOunce = data[key].usd
                  apiSuccess = true
                  console.log(`Found price in format 2 (key: ${key}): $${usdPricePerOunce} per ounce`)
                  break
                }
              }
              
              if (apiSuccess) break
              
              // Format 3: Direct numeric value (unlikely but possible)
              if (keys.length === 1 && typeof data[keys[0]] === "number" && data[keys[0]] > 0) {
                usdPricePerOunce = data[keys[0]]
                apiSuccess = true
                console.log(`Found price in format 3: $${usdPricePerOunce} per ounce`)
                break
              }
            }
          } catch (apiError) {
            console.error(`Error fetching ${silverId}:`, apiError)
            continue
          }
        }

        // If API failed, try direct CoinGecko API call as fallback
        if (!apiSuccess) {
          try {
            console.log("Trying direct CoinGecko API call...")
            const response = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=xag&vs_currencies=usd`
            )
            const directData = await response.json()
            console.log("Direct API Response:", JSON.stringify(directData, null, 2))
            
            if (directData && directData.xag && typeof directData.xag.usd === "number" && directData.xag.usd > 0) {
              usdPricePerOunce = directData.xag.usd
              apiSuccess = true
              console.log(`Found price via direct API: $${usdPricePerOunce} per ounce`)
            }
          } catch (directError) {
            console.error("Direct API call also failed:", directError)
          }
        }

          if (apiSuccess && usdPricePerOunce && usdPricePerOunce > 0) {
            // Convert from USD per troy ounce to INR per gram
            // 1 troy ounce = 31.1035 grams
            const usdPricePerGram = usdPricePerOunce / 31.1035
            const inrPricePerGram = usdPricePerGram * 85.5

            console.log(`Silver price calculated successfully:`)
            console.log(`  USD per ounce: $${usdPricePerOunce.toFixed(2)}`)
            console.log(`  USD per gram: $${usdPricePerGram.toFixed(4)}`)
            console.log(`  INR per gram: ₹${inrPricePerGram.toFixed(2)}`)

            // Ensure we have a valid positive number
            if (inrPricePerGram && inrPricePerGram > 0 && !isNaN(inrPricePerGram) && isFinite(inrPricePerGram)) {
              setSilverPrice(inrPricePerGram)
              console.log(`Setting silver price to: ${inrPricePerGram}`)
            } else {
              console.error(`Invalid price calculation: ${inrPricePerGram}`)
              throw new Error(`Invalid price calculation result: ${inrPricePerGram}`)
            }

          const prices = cities.map((city) => ({
            name: city.name,
            pricePerGram: (inrPricePerGram * city.taxFactor).toFixed(2),
          }))

          setCityPrices(prices)
        } else {
          // Use realistic mock data as fallback
          console.warn("API failed, using fallback price")
          const mockSilverPrice = 85 + Math.random() * 15 // Realistic price around 85-100 INR per gram
          if (mockSilverPrice && mockSilverPrice > 0 && !isNaN(mockSilverPrice)) {
            setSilverPrice(mockSilverPrice)
          } else {
            // Ultimate fallback
            setSilverPrice(90)
          }

          const mockPrices = cities.map((city) => ({
            name: city.name,
            pricePerGram: (mockSilverPrice * city.taxFactor).toFixed(2),
          }))

          setCityPrices(mockPrices)
          toast.info("Using estimated silver price. API data unavailable.", {
            position: "top-center",
          })
        }
      } catch (err) {
        console.error("Error:", err)
        // Even on error, show mock data so UI doesn't break
        const mockSilverPrice = 85 + Math.random() * 15
        if (mockSilverPrice && mockSilverPrice > 0 && !isNaN(mockSilverPrice)) {
          setSilverPrice(mockSilverPrice)
        } else {
          // Ultimate fallback
          setSilverPrice(90)
        }

        const mockPrices = cities.map((city) => ({
          name: city.name,
          pricePerGram: (mockSilverPrice * city.taxFactor).toFixed(2),
        }))

        setCityPrices(mockPrices)
        setError(`Error fetching data: ${err.message}. Showing estimated price.`)
        toast.warn("Using estimated silver price due to API error.", {
          position: "top-center",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSilverPrice()
  }, [cities])

  const handleCityChange = useCallback(
    (e) => {
      const city = e.target.value
      setSelectedCity(city)

      const selectedCityPrice = cityPrices.find((c) => c.name === city)?.pricePerGram
      if (selectedCityPrice) {
        setCalculatedPrice((parseFloat(selectedCityPrice) * quantity).toFixed(2))
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
        setCalculatedPrice((parseFloat(selectedCityPrice) * qty).toFixed(2))
      }
    },
    [cityPrices, selectedCity],
  )

  return (
    <div className="silver-container">
      <h1>Silver Prices in Indian Cities</h1>
      {loading ? (
        <LoadingSpinner message="Fetching silver prices..." />
      ) : error && !silverPrice ? (
        <p className="error-message">{error}</p>
      ) : silverPrice && silverPrice > 0 ? (
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
      ) : null}
    </div>
  )
}

export default Silver

