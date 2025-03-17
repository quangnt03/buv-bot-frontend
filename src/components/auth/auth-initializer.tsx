"use client"

import type React from "react"

import { useAuthInit } from "@/hooks/use-auth-init"

interface AuthInitializerProps {
  children: React.ReactNode
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  // Initialize auth state on app load
  useAuthInit()

  // Just render children, the hook handles the initialization
  return <>{children}</>
}

