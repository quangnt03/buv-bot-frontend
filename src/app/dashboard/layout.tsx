import type React from "react"
import { NavBar } from "@/components/dashboard/nav-bar"
import { AuthGuard } from "@/components/auth/auth-guard"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-background">
          <NavBar />
          <main className="flex w-screen">{children}</main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
