"use client"

import { useContext } from "react"
import "./Navbar.css"
import logo from "../../assets/logo.png"
import Arrow from "../../assets/Arrow.png"
import { Link, useNavigate } from "react-router-dom" // Import useNavigate
import { AuthContext } from "../../assets/Context"
import { auth } from "../Signup/firebase"

const Navbar = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate() // Initialize useNavigate

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        console.log("User signed out")
        navigate("/") // Redirect to home page
      })
      .catch((error) => {
        console.error("Error signing out: ", error)
      })
  }

  return (
    <div className="Navbar">
      <Link to="/">
        <img src={logo} className="logo" alt="Logo" />
      </Link>

      <ul>
        <Link to="/">
          <li>Home</li>
        </Link>
        <li>Features</li>
        <li className="dropdown-2">
          <span>Commodities Market</span>
          <ul className="dropdown-menu-2">
            <Link to="/Gold">
              <li className="gold">Gold</li>
            </Link>
            <Link to="/Silver">
              <li className="silver">Silver</li>
            </Link>
            <Link to="/Platinum">
              <li className="platinum">Platinum</li>
            </Link>
          </ul>
        </li>
        <li className="dropdown">
          <span>News</span>
          <ul className="dropdown-menu">
            <Link to="/LatestNews">
              <li>Latest News</li>
            </Link>
            <Link to="/competition">
              <li>Competition</li>
            </Link>
            <Link to="/community">
              <li>Community</li>
            </Link>
          </ul>
        </li>
        {user && (
          <Link to="/favorites">
            <li>Favorites</li>
          </Link>
        )}
      </ul>
      <div className="nav-right">
        {user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <button>
            <Link to="/Login">Login</Link>
            <img src={Arrow} className="Arrow" alt="Arrow" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar

