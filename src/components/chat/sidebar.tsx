"use client"

import { useEffect, useState } from "react"
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
import { Search, PenSquare, Plus, Folder, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderItem } from "@/components/dashboard/folder-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useConversationStore } from "@/store/conversation-store"
import { useConversations } from "@/hooks/use-conversations"
import { useItem } from "@/hooks/use-items"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreateConversationDialog } from "@/components/dashboard/create-conversation-dialog"

export function Sidebar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Use the hooks to fetch conversations
  const { data: conversationsData, isLoading: isLoadingConversations } = useConversations()

  // Get state from Zustand stores
  const { conversations, selectConversation, selectedConversationId } = useConversationStore()

  // Fetch items for selected conversation
  const { isLoading: isLoadingItems } = useItem(
    selectedConversationId ? { conversation_id: selectedConversationId } : undefined,
  )

  // Auto-select first conversation if none is selected
  useEffect(() => {
    if (!isLoadingConversations && conversations.length > 0 && !selectedConversationId) {
      selectConversation(conversations[0].id)
    }
  }, [isLoadingConversations, conversations, selectedConversationId, selectConversation])

  const filteredConversations = searchTerm
    ? conversations.filter((conv) => conv.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : conversations

  const handleCreateFolder = () => {
    setShowCreateDialog(true)
  }

  return (
    <>
      <ShadcnSidebar className="border-r">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search folders..."
              className="w-full pl-8 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
              <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleCreateFolder}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add folder</span>
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-[calc(100vh-180px)]">
                {isLoadingConversations ? (
                  <div className="px-4 py-2 text-sm text-muted-foreground">Loading folders...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No conversations available</AlertTitle>
                      <AlertDescription>Please start by creating a new conversation.</AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <SidebarMenu>
                    {filteredConversations.length > 0 ? (
                      filteredConversations.map((folder) => (
                        <SidebarMenuItem key={folder.id}>
                          <FolderItem id={folder.id} name={folder.title} />
                        </SidebarMenuItem>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-muted-foreground">No folders found</div>
                    )}
                  </SidebarMenu>
                )}
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleCreateFolder}>
            <Folder className="mr-2 h-4 w-4" />
            Create New Folder
          </Button>
        </SidebarFooter>
      </ShadcnSidebar>

      <CreateConversationDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  )
}
