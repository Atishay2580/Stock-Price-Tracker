// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5V90EN8UfqWhNhbfZ3p9FnWgLp92EnAI",
  authDomain: "login-79500.firebaseapp.com",
  projectId: "login-79500",
  storageBucket: "login-79500.appspot.com",
  messagingSenderId: "440640521265",
  appId: "1:440640521265:web:1520b83f658d769a380110",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Check if we should use emulators (only in development)
const useEmulators = false // Set this to true only if you have emulators running

if (useEmulators && process.env.NODE_ENV === "development") {
  try {
    // Only connect to Firestore emulator - we're disabling Auth emulator
    // as it requires more setup and is not necessary for most development
    connectFirestoreEmulator(db, "localhost", 8080)
    console.log("Connected to Firestore emulator")
  } catch (error) {
    console.error("Failed to connect to Firebase emulators:", error)
  }
}

// Enable offline persistence for Firestore in production
if (process.env.NODE_ENV === "production") {
  try {
    db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
      } else if (err.code === "unimplemented") {
        console.warn("The current browser does not support all of the features required to enable persistence")
      }
    })
  } catch (error) {
    console.error("Error enabling persistence:", error)
  }
}

export default app

