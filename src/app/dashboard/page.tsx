"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MainContent } from "@/components/dashboard/main-content"

export default function DashboardPage() {
  const [searchValue, setSearchValue] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("All")

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
      <Sidebar />
      <MainContent
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
      />
    </div>
  )
}
