"use client"

import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

export function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar()
  
  // Only show the toggle button when the sidebar is collapsed
  if (state !== "collapsed") {
    return null
  }
  
  return (
    <Button
      variant="secondary"
      size="icon"
      className="fixed left-4 top-4 z-50 shadow-md md:flex hidden bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
      onClick={toggleSidebar}
      aria-label="Show sidebar"
    >
      <PanelLeft className="h-5 w-5" />
    </Button>
  )
} 