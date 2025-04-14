"use client"

import { useState } from "react"
import { ChevronRight, PenSquare, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface StorageItemProps {
  name: string
  type: "google-drive" | "dropbox" | "s3"
}

export function StorageItem({ name, type }: StorageItemProps) {
  const [isChecked, setIsChecked] = useState(false)

  const getIcon = () => {
    switch (type) {
      case "google-drive":
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 87.3 78" className="w-6 h-6">
              <path
                d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                fill="#0066da"
              />
              <path
                d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
                fill="#00ac47"
              />
              <path
                d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
                fill="#ea4335"
              />
              <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
              <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
              <path
                d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
                fill="#ffba00"
              />
            </svg>
          </div>
        )
      case "dropbox":
        return (
          <div className="w-8 h-8 flex items-center justify-center bg-[#0061FF] rounded">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
              <path d="M6 2L0 6.75l6 4.5 6-4.5L6 2zm12 0l-6 4.75 6 4.5 6-4.5L18 2zM0 15.75l6 4.5 6-4.5-6-4.5-6 4.5zm18 0l6 4.5-6-4.5-6 4.5 6 4.5z" />
            </svg>
          </div>
        )
      case "s3":
        return (
          <div className="w-8 h-8 flex items-center justify-center bg-[#4CAF50] rounded">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <path
                fill="currentColor"
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
              />
            </svg>
          </div>
        )
    }
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 border rounded-md bg-card hover:bg-accent/50 transition-colors group">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isChecked}
          onCheckedChange={(checked) => setIsChecked(checked as boolean)}
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
        {getIcon()}
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <PenSquare className="h-4 w-4" />
              <span className="sr-only">Edit item</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Move</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete item</span>
        </Button>
      </div>
    </div>
  )
}
