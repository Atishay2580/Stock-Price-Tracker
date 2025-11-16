import { createContext } from "react"
import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { getDatabase, set, ref } from "firebase/database"
import { useContext } from "react"

const firebaseConfig = {
  apiKey: "AIzaSyAyYEVAAbcSNgHqpEiwiUcOldBkaWkml_s",
  authDomain: "stock-price-tracker-86a63.firebaseapp.com",
  projectId: "stock-price-tracker-86a63",
  storageBucket: "stock-price-tracker-86a63.firebasestorage.app",
  messagingSenderId: "49558247792",
  appId: "1:49558247792:web:71f95e7c87d388d69457b5",
  databaseURL: ""
};

const firebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(firebaseApp)
export const db = getDatabase(firebaseApp)

const FirebaseContext = createContext(null)

export const useFirebase = () => useContext(FirebaseContext)

export const FirebaseProvider = (props) => {
  const signUpUserWithEmailAndPassword = (email, password) => {
    return createUserWithEmailAndPassword(firebaseAuth, email, password)
  }

  const signInUserWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(firebaseAuth, email, password)
  }

  const signOutUser = () => {
    return signOut(firebaseAuth)
  }

  const putData = (key, data) => set(ref(db, key), data)

  return (
    <FirebaseContext.Provider
      value={{
        signUpUserWithEmailAndPassword,
        signInUserWithEmailAndPassword,
        signOutUser,
        putData,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  )
}