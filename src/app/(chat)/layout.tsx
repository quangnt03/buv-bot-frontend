"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"


export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 m-4 overflow-hidden flex flex-col">
          {children}
        </Card>
      </div>
    </div>
  )
}

