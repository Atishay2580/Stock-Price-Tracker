import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "../components/Signup/firebase"
import { stockService } from "../services/api"

/**
 * Check all active notifications and send alerts if thresholds are met
 * This function should be called periodically (e.g., via Cloud Functions or scheduled task)
 */
export const checkNotifications = async () => {
  try {
    // Get all active notifications
    const notificationsRef = collection(db, "notifications")
    const activeNotificationsQuery = query(
      notificationsRef,
      where("status", "==", "active"),
      where("notified", "==", false)
    )

    const snapshot = await getDocs(activeNotificationsQuery)
    const notifications = []

    snapshot.forEach((docSnapshot) => {
      notifications.push({ id: docSnapshot.id, ...docSnapshot.data() })
    })

    console.log(`Checking ${notifications.length} active notifications...`)

    // Check each notification
    for (const notification of notifications) {
      try {
        // Fetch current price
        const quoteData = await stockService.getQuote(notification.symbol)
        const currentPrice = quoteData?.c

        if (!currentPrice) {
          console.log(`Could not fetch price for ${notification.symbol}`)
          continue
        }

        // Check if threshold is met
        const thresholdMet =
          (notification.percentageThreshold &&
            Math.abs((currentPrice - notification.basePrice) / notification.basePrice) * 100 >=
              Math.abs(notification.percentageThreshold)) ||
          (notification.priceChangeThreshold &&
            Math.abs(currentPrice - notification.basePrice) >= Math.abs(notification.priceChangeThreshold))

        if (thresholdMet) {
          // Send email notification
          await sendAlertEmail(notification, currentPrice)

          // Mark as notified
          const notificationDocRef = doc(db, "notifications", notification.id)
          await updateDoc(notificationDocRef, {
            notified: true,
            notifiedAt: new Date().toISOString(),
            currentPriceAtNotification: currentPrice,
          })

          console.log(`Notification sent for ${notification.symbol} to ${notification.userEmail}`)
        }
      } catch (error) {
        console.error(`Error checking notification ${notification.id}:`, error)
      }
    }

    return { checked: notifications.length, sent: 0 }
  } catch (error) {
    console.error("Error checking notifications:", error)
    throw error
  }
}

/**
 * Send alert email when price threshold is met
 */
const sendAlertEmail = async (notification, currentPrice) => {
  try {
    const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!emailjsPublicKey) {
      console.warn("EmailJS not configured. Cannot send alert email.")
      return
    }

    const emailjs = await import("@emailjs/browser")

    // Initialize EmailJS
    emailjs.init(emailjsPublicKey)

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "your_service_id"
    const templateId = import.meta.env.VITE_EMAILJS_ALERT_TEMPLATE_ID || "your_alert_template_id"

    const priceChange = currentPrice - notification.basePrice
    const percentageChange = ((priceChange / notification.basePrice) * 100).toFixed(2)

    const templateParams = {
      to_email: notification.userEmail,
      symbol: notification.symbol,
      base_price: notification.basePrice.toFixed(2),
      current_price: currentPrice.toFixed(2),
      target_price: notification.targetPrice.toFixed(2),
      price_change: priceChange.toFixed(2),
      percentage_change: percentageChange,
      message: `Alert! ${notification.symbol} has reached your target price of $${notification.targetPrice.toFixed(2)}. Current price: $${currentPrice.toFixed(2)}`,
    }

    await emailjs.send(serviceId, templateId, templateParams)
    console.log(`Alert email sent to ${notification.userEmail}`)
  } catch (error) {
    console.error("Error sending alert email:", error)
    throw error
  }
}
