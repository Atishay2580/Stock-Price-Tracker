import "./LoadingSpinner.css"

const LoadingSpinner = ({ message = "Fetching stocks..." }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner"></div>
        <p className="loading-text">{message}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner

