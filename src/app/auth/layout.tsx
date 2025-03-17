import type React from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { NavBar } from "@/components/dashboard/nav-bar"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen min-w-screen flex flex-col">
        <main className="flex-1">{children}</main>
    </div>
  )
}

