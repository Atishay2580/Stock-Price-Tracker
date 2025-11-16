import Navbar from "./components/Navbar/Navbar"
import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home/Home"
import Stock from "./pages/Stock/Stock"
import Footer from "./components/Footer/Footer"
import LatestNews from "./pages/News/LatestNews"
import Gold from "./pages/Gold/Gold"
import Silver from "./pages/Silver/Silver"
import Platinum from "./pages/Platinum/Platinum"
import CandlestickChart from "./pages/Charts/Charts"
import Login from "./components/Signup/Login"
import Register from "./components/Signup/Register"
import Favorites from "./components/Favorites/Favorites"
import { ToastContainer } from "react-toastify"
import { AuthProvider } from "./assets/Context"
import { FirebaseProvider } from "./context/Firebase"
import Notification from "./pages/Notifyme/Notification"

const App = () => {
  return (
    // <AuthProvider>
    <FirebaseProvider>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stock/:stockId" element={<Stock />} />
          <Route path="/stock/:stockId/chart" element={<CandlestickChart />} />
          <Route path="/LatestNews" element={<LatestNews />} />
          <Route path="/Gold" element={<Gold />} />
          <Route path="/Silver" element={<Silver />} />
          <Route path="/Platinum" element={<Platinum />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/favorites/Notification" element={<Notification />} />
        </Routes>
        <ToastContainer />
        <Footer />
      </div>
    </FirebaseProvider>
    // </AuthProvider>
  )
}

export default App

