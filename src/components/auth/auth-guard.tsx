"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, refreshUser } = useAuthStore()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to refresh user data if not already authenticated
        if (!isAuthenticated) {
          await refreshUser()
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [isAuthenticated, refreshUser])

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isCheckingAuth && !isLoading && !isAuthenticated) {
      router.push("/auth/signin")
    }
  }, [isCheckingAuth, isLoading, isAuthenticated, router])

  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : null
}

