"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import SignInwithGoogle from "./SignInWIthGoogle"
import { useNavigate } from "react-router-dom"
import { useFirebase } from "../../context/Firebase"
import "./Login.css"

function Login() {
  const firebase = useFirebase()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please enter both email and password", { position: "bottom-center" })
      return
    }

    setLoading(true)

    try {
      await firebase.signInUserWithEmailAndPassword(email, password)

      toast.success("Login successful! Redirecting...", { position: "top-center" })

      setTimeout(() => navigate("/"), 800)
    } catch (error) {
      console.error("Login Error: ", error)
      const code = error.code || ""

      if (code.includes("user-not-found") || code.includes("wrong-password")) {
        toast.error("Invalid email or password. Please try again.", { position: "bottom-center" })
      } else if (code.includes("too-many-requests")) {
        toast.error("Too many failed login attempts. Please try again later or reset your password.", { position: "bottom-center" })
      } else if (code.includes("network-request-failed")) {
        toast.error("Network error. Please check your internet connection.", { position: "bottom-center" })
      } else {
        toast.error(`Login error: ${error.message || error}`, { position: "bottom-center" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h3 className="login-header">Login</h3>

        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <button type="submit" className="form-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="form-footer">
          New user? <a href="/register">Register Here</a>
        </p>
        <SignInwithGoogle />
      </form>
    </div>
  )
}

export default Login