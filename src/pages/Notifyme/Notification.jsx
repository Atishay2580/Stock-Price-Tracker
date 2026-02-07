"use client"

import { useState, useContext, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../components/Signup/firebase"
import { AuthContext } from "../../assets/Context"
import { toast } from "react-toastify"
import { stockService } from "../../services/api"
import "./Notification.css"

const Notification = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const queryParams = new URLSearchParams(location.search)

  const [percentage, setPercentage] = useState("")
  const [priceChange, setPriceChange] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(null)

  // Extract stock details from query parameters
  const stockDetails = {
    symbol: queryParams.get("symbol") || "N/A",
    price: queryParams.get("price") || "N/A",
    change: queryParams.get("change") || "N/A",
  }

  // Fetch current price on mount
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      if (stockDetails.symbol && stockDetails.symbol !== "N/A") {
        try {
          const quoteData = await stockService.getQuote(stockDetails.symbol)
          if (quoteData && quoteData.c) {
            setCurrentPrice(quoteData.c.toFixed(2))
          }
        } catch (error) {
          console.error("Error fetching current price:", error)
        }
      }
    }
    fetchCurrentPrice()
  }, [stockDetails.symbol])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      toast.error("Please login to set notifications", {
        position: "top-center",
      })
      navigate("/login")
      return
    }

    if (!percentage && !priceChange) {
      toast.error("Please fill at least one field!", {
        position: "top-center",
      })
      return
    }

    setLoading(true)

    try {
      const basePrice = currentPrice || parseFloat(stockDetails.price) || 0
      
      if (basePrice === 0) {
        toast.error("Unable to determine current price. Please try again.", {
          position: "top-center",
        })
        setLoading(false)
        return
      }

      // Calculate target prices
      let targetPrice = basePrice
      if (percentage) {
        const percentChange = parseFloat(percentage) / 100
        targetPrice = basePrice * (1 + percentChange)
      } else if (priceChange) {
        targetPrice = basePrice + parseFloat(priceChange)
      }

      // Create notification document
      const notificationData = {
        userId: user.uid,
        userEmail: user.email,
        symbol: stockDetails.symbol,
        basePrice: basePrice,
        targetPrice: targetPrice,
        percentageThreshold: percentage ? parseFloat(percentage) : null,
        priceChangeThreshold: priceChange ? parseFloat(priceChange) : null,
        createdAt: new Date().toISOString(),
        status: "active",
        notified: false,
      }

      // Store in Firestore
      const notificationRef = doc(
        collection(db, "notifications"),
        `${user.uid}_${stockDetails.symbol}_${Date.now()}`
      )

      await setDoc(notificationRef, notificationData)

      toast.success("Notification set successfully! You will receive an email when the price threshold is met.", {
        position: "top-center",
      })

      // Send confirmation email
      await sendNotificationEmail(user.email, stockDetails.symbol, basePrice, targetPrice, percentage, priceChange)

      setPercentage("")
      setPriceChange("")
      navigate("/favorites")
    } catch (error) {
      console.error("Error setting notification:", error)
      toast.error("Failed to set notification. Please try again.", {
        position: "top-center",
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to send email notification using EmailJS
  const sendNotificationEmail = async (email, symbol, basePrice, targetPrice, percentage, priceChange) => {
    try {
      // Check if EmailJS is configured
      const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      
      if (!emailjsPublicKey) {
        console.warn("EmailJS not configured. Skipping email send. See EMAILJS_SETUP.md for setup instructions.")
        return
      }

      // Dynamic import of EmailJS
      const emailjs = await import("@emailjs/browser")
      
      // Initialize EmailJS
      emailjs.init(emailjsPublicKey)
      
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "your_service_id"
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "your_template_id"

      const templateParams = {
        to_email: email,
        symbol: symbol,
        base_price: basePrice.toFixed(2),
        target_price: targetPrice.toFixed(2),
        percentage: percentage || "N/A",
        price_change: priceChange || "N/A",
        message: `You've set a notification for ${symbol}. We'll notify you when the price reaches $${targetPrice.toFixed(2)}.`,
      }

      await emailjs.send(serviceId, templateId, templateParams)
      console.log("Confirmation email sent successfully")
    } catch (error) {
      console.error("Error sending email:", error)
      // Don't throw - notification is still saved even if email fails
      toast.warn("Notification saved but email could not be sent. Please check EmailJS configuration.", {
        position: "top-center",
      })
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
        {!user ? (
          <div className="login-prompt">
            <p>Please login to set price alerts</p>
            <button onClick={() => navigate("/login")} className="login-button">
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="current-price-info">
              <p>
                <strong>Current Price:</strong> ${currentPrice || stockDetails.price}
              </p>
            </div>
            <label>
              Percentage Change (%):
              <input
                type="number"
                step="0.01"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="e.g., 5 for 5% increase"
              />
              {percentage && (
                <span className="target-price-preview">
                  Target: ${(
                    (currentPrice || parseFloat(stockDetails.price) || 0) *
                    (1 + parseFloat(percentage) / 100)
                  ).toFixed(2)}
                </span>
              )}
            </label>
            <label>
              Price Change ($):
              <input
                type="number"
                step="0.01"
                value={priceChange}
                onChange={(e) => setPriceChange(e.target.value)}
                placeholder="e.g., 10 for $10 increase"
              />
              {priceChange && (
                <span className="target-price-preview">
                  Target: ${(
                    (currentPrice || parseFloat(stockDetails.price) || 0) +
                    parseFloat(priceChange)
                  ).toFixed(2)}
                </span>
              )}
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Setting Notification..." : "Set Notification"}
            </button>
            <p className="info-text">
              You will receive an email notification when the stock price reaches your target.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default Notification

