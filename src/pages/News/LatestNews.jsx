"use client"

import React, { useEffect, useState, useCallback } from "react"
import "./LatestNews.css"
import LoadingSpinner from "../../components/Loading/LoadingSpinner"
import { newsService } from "../../services/api"

const LatestNews = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150"

  const fetchNews = useCallback(async (currentPage) => {
    setLoading(true)
    setError(null)

    try {
      try {
        const data = await newsService.getNews("stocks", currentPage)

        if (data.articles && data.articles.length > 0) {
          setNews(data.articles)
        } else {
          throw new Error("No articles found for this page.")
        }
      } catch (apiError) {
        console.error("API Error:", apiError)

        // Generate mock news data
        const mockNews = Array.from({ length: 12 }, (_, i) => ({
          title: `Stock Market Update ${i + 1}: Major Indices ${Math.random() > 0.5 ? "Rise" : "Fall"} Amid Economic Data`,
          description: `The stock market ${Math.random() > 0.5 ? "gained" : "lost"} ground today as investors reacted to new economic data and corporate earnings reports. Analysts suggest this trend may continue in the coming weeks.`,
          url: "https://example.com/news",
          urlToImage: `https://via.placeholder.com/600x400?text=Stock+News+${i + 1}`,
        }))

        setNews(mockNews)
        console.log("Using mock news data due to API errors")
      }
    } catch (err) {
      console.error("News fetch error:", err)
      setError(err.message || "Failed to fetch news. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews(page)
  }, [page, fetchNews])

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1)
    }
  }, [page])

  const handleNextPage = useCallback(() => {
    setPage(page + 1)
  }, [page])

  if (loading) {
    return (
      <div className="news-container">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return <div className="news-container">Error: {error}</div>
  }

  return (
    <div className="news-container">
      <h1 className="news-heading">Latest Stock News</h1>
      {news.length === 0 ? (
        <p>No news articles available at the moment.</p>
      ) : (
        <div className="news-grid">
          {news.map((article, index) => (
            <div className="news-card" key={index}>
              <img
                src={article.urlToImage || PLACEHOLDER_IMAGE}
                alt={article.title || "News article"}
                className="news-image"
                loading="lazy"
              />
              <h2 className="news-title">{article.title}</h2>
              <p className="news-description">{article.description || "No description available."}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-link">
                Read More
              </a>
            </div>
          ))}
        </div>
      )}
      <div className="pagination">
        <button className="pagination-button" onClick={handlePrevPage} disabled={page === 1}>
          Previous
        </button>
        <span className="page-info">Page {page}</span>
        <button className="pagination-button" onClick={handleNextPage}>
          Next
        </button>
      </div>
    </div>
  )
}

export default React.memo(LatestNews)

