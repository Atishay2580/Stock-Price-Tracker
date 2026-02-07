 "use client"

import { createContext, useState, useEffect } from "react"
import { auth } from "../components/Signup/firebase"
import { onAuthStateChanged } from "firebase/auth"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null)
      setInitializing(false)
    })

    return () => unsubscribe()
  }, [])

  if (initializing) {
    return null
  }

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}

