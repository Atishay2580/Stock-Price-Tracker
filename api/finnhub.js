import axios from "axios"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { endpoint, symbol } = req.body
    const API_KEY = process.env.FINNHUB_API_KEY
    const BASE_URL = "https://finnhub.io/api/v1"

    const response = await axios.get(`${BASE_URL}/${endpoint}`, {
      params: {
        symbol: symbol,
        token: API_KEY,
      },
    })

    return res.status(200).json(response.data)
  } catch (error) {
    console.error("Error:", error)
    return res.status(500).json({ error: "Failed fetching data" })
  }
}

