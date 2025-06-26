"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("Setting up auth state listener")

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user")
        setUser(user)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error("Auth state change error:", error)
        setError(error.message)
        setLoading(false)
      },
    )

    return () => {
      console.log("Cleaning up auth state listener")
      unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
