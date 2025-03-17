import type React from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { NavBar } from "@/components/dashboard/nav-bar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  )
}

