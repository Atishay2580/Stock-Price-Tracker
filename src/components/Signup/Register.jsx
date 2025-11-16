"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useFirebase } from "../../context/Firebase"
import "./Register.css"

function Register() {
  const firebase = useFirebase()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fname, setFname] = useState("")
  const [lname, setLname] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!email || !password || !fname) {
      toast.error("Please fill in all required fields", { position: "bottom-center" })
      return
    }

    if (password.length < 6) {
      toast.error("Password should be at least 6 characters", { position: "bottom-center" })
      return
    }

    setLoading(true)

    try {
      const userCredential = await firebase.signUpUserWithEmailAndPassword(email, password)
      const user = userCredential.user

      if (user) {
        await firebase.putData("users/" + user.uid, {
          uid: user.uid,
          email: user.email,
          firstName: fname,
          lastName: lname || "",
          photo: "",
          createdAt: new Date().toISOString(),
        })

        toast.success("Registration successful! Redirecting to login...", { position: "top-center" })
        setTimeout(() => navigate("/login"), 1500)
      }
    } catch (error) {
      console.error("Registration error:", error)
      const code = error.code || ""

      if (code.includes("email-already-in-use")) {
        toast.error("This email is already registered. Please log in or use a different email.", { position: "bottom-center" })
      } else if (code.includes("invalid-email")) {
        toast.error("Please enter a valid email address.", { position: "bottom-center" })
      } else if (code.includes("network-request-failed")) {
        toast.error("Network error. Please check your internet connection.", { position: "bottom-center" })
      } else {
        toast.error(`Registration failed: ${error.message || error}`, { position: "bottom-center" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <form onSubmit={handleRegister} className="register-form">
        <h3 className="register-header">Sign Up</h3>

        <div className="form-group">
          <label className="form-label">First name*</label>
          <input
            type="text"
            className="form-input"
            placeholder="First name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Last name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Last name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email address*</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password*</label>
          <input
            type="password"
            className="form-input"
            value={password}
            placeholder="Enter password (min 6 characters)"
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <button type="submit" className="form-button" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>
        <p className="form-footer">
          Already registered? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  )
}

export default Register