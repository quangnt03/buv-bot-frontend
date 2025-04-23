import type React from "react"
import { NavBar } from "@/components/dashboard/nav-bar"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Sidebar } from "@/components/dashboard/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden w-full">
        <SidebarProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-auto">
              <NavBar /> 
              {children}
            </main>
          </div>
        </SidebarProvider>
      </div>
    </AuthGuard>
  )
}
