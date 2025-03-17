"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"

export function useAuthInit() {
  const { refreshUser, isLoading } = useAuthStore()

  useEffect(() => {
    // Try to refresh the user data on initial load
    refreshUser()
  }, [refreshUser])

  return { isLoading }
}

