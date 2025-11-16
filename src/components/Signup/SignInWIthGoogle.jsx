"use client"

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { useState } from "react"
import { auth, db } from "./firebase"
import { toast } from "react-toastify"
import { setDoc, doc, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

function SignInwithGoogle() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const googleLogin = async () => {
    setLoading(true)
    const provider = new GoogleAuthProvider()

    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if this is the first login for this user
      const userDocRef = doc(db, "Users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // First time login, create user record
        const firstName = user.displayName?.split(" ")[0] || "Unknown"
        const lastName = user.displayName?.split(" ")[1] || ""

        await setDoc(userDocRef, {
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          photo: user.photoURL || "",
          createdAt: new Date().toISOString(),
        })
      }

      toast.success(`Welcome, ${user.displayName || "User"}!`, {
        position: "top-center",
      })

      // Redirect to home page
      setTimeout(() => {
        navigate("/")
      }, 1000)
    } catch (error) {
      console.error("Google login error: ", error)

      if (error.code === "auth/popup-closed-by-user") {
        toast.info("Google sign-in canceled.", {
          position: "bottom-center",
        })
      } else if (error.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your internet connection.", {
          position: "bottom-center",
        })
      } else {
        toast.error("Google login failed. Please try again.", {
          position: "bottom-center",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="continue-p">-- Or continue with --</p>
      <br />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button className="btn btn-danger" onClick={googleLogin} disabled={loading}>
          {loading ? "Connecting..." : "Login with Google"}
        </button>
      </div>
    </div>
  )
}

export default SignInwithGoogle

