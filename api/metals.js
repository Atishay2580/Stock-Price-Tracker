import axios from "axios"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { metal } = req.body
    const API_KEY = process.env.COINGECKO_API_KEY

    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${metal}&vs_currencies=usd`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    return res.status(200).json(response.data)
  } catch (error) {
    console.error("Error:", error)
    return res.status(500).json({ error: "Failed fetching metal price data" })
  }
}

