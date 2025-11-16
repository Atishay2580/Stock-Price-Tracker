"use client"

import { createUserWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"
import { auth, db } from "./firebase"
import { setDoc, doc } from "firebase/firestore"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import "./Register.css"

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fname, setFname] = useState("")
  const [lname, setLname] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()

    // Form validation
    if (!email || !password || !fname) {
      toast.error("Please fill in all required fields", {
        position: "bottom-center",
      })
      return
    }

    if (password.length < 6) {
      toast.error("Password should be at least 6 characters", {
        position: "bottom-center",
      })
      return
    }

    setLoading(true)

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (user) {
        // Add user to Firestore database
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname || "", // Handle empty last name
          photo: "",
          createdAt: new Date().toISOString(),
        })

        toast.success("Registration successful! Redirecting to login...", {
          position: "top-center",
        })

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      }
    } catch (error) {
      console.error("Registration error:", error.message)

      // Handle different types of Firebase errors with user-friendly messages
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered. Please log in or use a different email.", {
          position: "bottom-center",
        })
      } else if (error.code === "auth/invalid-email") {
        toast.error("Please enter a valid email address.", {
          position: "bottom-center",
        })
      } else if (error.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your internet connection.", {
          position: "bottom-center",
        })
      } else {
        toast.error(`Registration failed: ${error.message}`, {
          position: "bottom-center",
        })
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
            onChange={(e) => setLname(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email address*</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password*</label>
          <input
            type="password"
            className="form-input"
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

