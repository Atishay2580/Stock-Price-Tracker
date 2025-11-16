"use client"

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { useState } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { useFirebase, firebaseAuth } from "../../context/Firebase"
import "./SignInWithGoogle.css" // optional styling file

function SignInWithGoogle() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const firebase = useFirebase()

  const googleLogin = async () => {
    setLoading(true)
    const provider = new GoogleAuthProvider()

    try {
      const result = await signInWithPopup(firebaseAuth, provider)
      const user = result.user

      if (user) {
        const nameParts = (user.displayName || "").split(" ")
        const firstName = nameParts[0] || "Unknown"
        const lastName = nameParts.slice(1).join(" ") || ""

        // Save / update user data in Realtime Database under users/{uid}
        await firebase.putData("users/" + user.uid, {
          uid: user.uid,
          email: user.email || "",
          firstName,
          lastName,
          photo: user.photoURL || "",
          createdAt: new Date().toISOString(),
        })
      }

      toast.success(`Welcome, ${user.displayName || "User"}!`, { position: "top-center" })
      setTimeout(() => navigate("/"), 900)
    } catch (error) {
      console.error("Google login error: ", error)
      const code = error.code || ""

      if (code.includes("popup-closed-by-user")) {
        toast.info("Google sign-in canceled.", { position: "bottom-center" })
      } else if (code.includes("network-request-failed")) {
        toast.error("Network error. Please check your internet connection.", { position: "bottom-center" })
      } else {
        toast.error("Google login failed. Please try again.", { position: "bottom-center" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="continue-p">-- Or continue with --</p>
      <br />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button className="btn btn-danger" onClick={googleLogin} disabled={loading}>
          {loading ? "Connecting..." : "Login with Google"}
        </button>
      </div>
    </div>
  )
}

export default SignInWithGoogle