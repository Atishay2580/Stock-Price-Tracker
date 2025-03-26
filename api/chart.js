import axios from "axios"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { symbol } = req.body
    const API_KEY = process.env.TWELVE_DATA_API_KEY
    const API_URL = "https://api.twelvedata.com/time_series"

    const response = await axios.get(API_URL, {
      params: {
        symbol: symbol,
        interval: "1day",
        apikey: API_KEY,
        outputsize: "100",
      },
    })

    return res.status(200).json(response.data)
  } catch (error) {
    console.error("Error:", error)
    return res.status(500).json({ error: "Failed fetching chart data" })
  }
}

