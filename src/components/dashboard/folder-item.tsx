"use client"

import { Folder, PenSquare, Trash2 } from "lucide-react"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface FolderItemProps {
  name: string
  count: number
}

export function FolderItem({ name, count }: FolderItemProps) {
  return (
    <SidebarMenuButton asChild className="w-full justify-between group">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Folder className="h-4 w-4" />
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
            >
              {count}
            </Badge>
          </div>
          <span className="text-sm font-medium">{name}</span>
        </div>
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <PenSquare className="h-4 w-4" />
                <span className="sr-only">Edit folder</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete folder</span>
          </Button>
        </div>
      </div>
    </SidebarMenuButton>
  )
}
