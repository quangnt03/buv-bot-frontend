"use client"

import { useState } from "react"
import { MainContent } from "@/components/dashboard/main-content"
import { useSidebar } from "@/components/ui/sidebar"
import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [searchValue, setSearchValue] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("All")
  const { state: sidebarState, toggleSidebar } = useSidebar()

  return (
    <div className="relative h-full w-full">
      {/* Floating sidebar toggle button - only visible when sidebar is collapsed */}
      {sidebarState === "collapsed" && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed left-4 top-4 z-50 shadow-md md:flex hidden bg-white text-gray-700 hover:bg-gray-100"
          onClick={toggleSidebar}
          aria-label="Show sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}
      
      <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
        <MainContent />
      </div>
    </div>
  )
}
