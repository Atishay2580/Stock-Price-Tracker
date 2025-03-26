"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Chart } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler,
} from "chart.js"
import { useParams } from "react-router-dom"
import { chartService } from "../../services/api"
import LoadingSpinner from "../../components/Loading/LoadingSpinner"
import "./Charts.css"

// Registering chart.js components
ChartJS.register(CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement, Filler)

const Charts = () => {
  const { stockId } = useParams()
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!stockId) return

      setLoading(true)
      setError(null)

      try {
        try {
          const response = await chartService.getChartData(stockId)

          if (response.values) {
            const data = response.values

            // Prepare data for the Line chart
            const lineChartData = {
              labels: data.map((item) => item.datetime).reverse(),
              datasets: [
                {
                  label: `${stockId} Price`,
                  data: data.map((item) => Number.parseFloat(item.close)).reverse(),
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  fill: true,
                  tension: 0.4,
                },
              ],
            }

            setChartData(lineChartData)
          } else {
            throw new Error("Failed to fetch data.")
          }
        } catch (apiError) {
          console.error("API Error:", apiError)

          // Generate mock chart data
          const mockDates = Array.from({ length: 100 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (100 - i))
            return date.toISOString().split("T")[0]
          })

          // Generate a somewhat realistic price trend
          let basePrice = 100 + Math.random() * 200
          const mockPrices = mockDates.map(() => {
            basePrice = basePrice + (Math.random() - 0.5) * 5
            return basePrice
          })

          const mockChartData = {
            labels: mockDates,
            datasets: [
              {
                label: `${stockId} Price (Mock Data)`,
                data: mockPrices,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
                tension: 0.4,
              },
            ],
          }

          setChartData(mockChartData)
          console.log("Using mock chart data due to API errors")
        }
      } catch (err) {
        console.error("Chart data fetch error:", err)
        setError(err.message || "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [stockId])

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
          ticks: {
            autoSkip: true,
            maxRotation: 45,
          },
        },
        y: {
          title: {
            display: true,
            text: "Price (USD)",
          },
        },
      },
    }),
    [],
  )

  return (
    <div style={{ width: "80%", margin: "auto", paddingTop: "20px" }}>
      <h2>{stockId ? `${stockId} Line Chart` : "Loading..."}</h2>
      {loading && <LoadingSpinner />}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {chartData && (
        <div>
          <h3>Price Trend (Last 100 Days)</h3>
          <Chart type="line" data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  )
}

export default React.memo(Charts)

