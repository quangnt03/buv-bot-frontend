"use client"

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Search, PenSquare, Plus, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderItem } from "./folder-item"
import { ScrollArea } from "@/components/ui/scroll-area"

export function Sidebar() {
  const folders = [
    { id: 1, name: "Folder 1", count: 3 },
    { id: 2, name: "Folder 2", count: 3 },
    { id: 3, name: "Folder 3", count: 3 },
    { id: 4, name: "Folder 4", count: 3 },
    { id: 5, name: "Folder 5", count: 3 },
    { id: 6, name: "Folder 6", count: 3 },
  ]

  return (
    <ShadcnSidebar className="border-r">
      <SidebarHeader className="p-4 flex items-center justify-between">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search folders..." className="w-full pl-8 h-9" />
        </div>
        <Button size="icon" variant="ghost" className="ml-2">
          <PenSquare className="h-5 w-5" />
          <span className="sr-only">New note</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between items-center">
            Folders
            <Button size="icon" variant="ghost" className="h-5 w-5">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add folder</span>
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-180px)]">
              <SidebarMenu>
                {folders.map((folder) => (
                  <SidebarMenuItem key={folder.id}>
                    <FolderItem name={folder.name} count={folder.count} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <Button variant="outline" className="w-full">
          <Folder className="mr-2 h-4 w-4" />
          Create New Folder
        </Button>
      </SidebarFooter>
    </ShadcnSidebar>
  )
}
