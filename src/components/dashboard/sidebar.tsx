"use client"

import { useEffect, useState, useRef } from "react"
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
import { Search, PenSquare, Plus, Folder, AlertCircle, PanelLeftClose, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderItem } from "@/components/dashboard/folder-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useConversationStore } from "@/store/conversation-store"
import { useConversations, useSearchConversations } from "@/hooks/use-conversations"
import { useItem } from "@/hooks/use-items"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreateConversationDialog } from "./create-conversation-dialog"
import { itemsService } from "@/services/items-service"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import { useSidebar } from "@/components/ui/sidebar"

export function Sidebar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSearchButton, setShowSearchButton] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const storeInitialized = useRef(false)
  const { toggleSidebar, state } = useSidebar()

  // Use the hooks to fetch conversations from API
  const { data: conversationsData, isLoading: isLoadingConversations, error, refetch } = useConversations()
  const searchConversationsMutation = useSearchConversations()

  // Get state and actions from Zustand store
  const { 
    conversations, 
    selectConversation, 
    selectedConversationId, 
    setConversations, 
    updateConversation,
    addConversation,
    deleteConversation
  } = useConversationStore()

  // Update the Zustand store - with initialization logic
  useEffect(() => {    
    if (conversationsData && Array.isArray(conversationsData)) {
      // Initial store setup - only do this once
      if (!storeInitialized.current) {
        // Map API response to the format expected by the store
        const formattedConversations = conversationsData.map(conv => ({
          id: conv.id,
          title: conv.title
        }));
        
        setConversations(formattedConversations);
        storeInitialized.current = true;
      } 
      // After initialization, only update changed conversations
      else {
        // Compare API data with store data to find changes
        conversationsData.forEach(apiConv => {
          const existingConv = conversations.find(storeConv => storeConv.id === apiConv.id);
          
          if (!existingConv) {
            // This is a new conversation
            addConversation({
              id: apiConv.id,
              title: apiConv.title
            });
          } 
          else if (existingConv.title !== apiConv.title) {
            // This conversation was updated
            updateConversation(apiConv.id, {
              title: apiConv.title
            });
          }
        });
        
        // Check for deleted conversations
        conversations.forEach(storeConv => {
          const stillExists = conversationsData.some(apiConv => apiConv.id === storeConv.id);
          if (!stillExists) {
            // Sync local store when server indicates a conversation was deleted
            deleteConversation(storeConv.id);
          }
        });
      }
    }
  }, [conversationsData, conversations, setConversations, updateConversation, addConversation, deleteConversation]);

  // Auto-select first conversation if none is selected
  useEffect(() => {
    if (!isLoadingConversations && conversations.length > 0 && !selectedConversationId) {
      selectConversation(conversations[0].id)
    }
  }, [isLoadingConversations, conversations, selectedConversationId, selectConversation])

  // Handle refresh on conversation deletion
  const handleConversationDeleted = () => {
    // Refresh the conversations list after deletion
    refetch();
  };

  // Show search button when search term is entered
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setShowSearchButton(true)
    } else {
      setShowSearchButton(false)
      setSearchResults([])
      setIsSearching(false)
    }
  }, [searchTerm])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    try {
      setIsSearching(true)
      const result = await searchConversationsMutation.mutateAsync(searchTerm)
      if (result && Array.isArray(result)) {
        setSearchResults(result)
        
        // Select the first conversation from search results if any are found
        if (result.length > 0 && result[0].id) {
          selectConversation(result[0].id)
        }
      } else {
        setSearchResults([])
        toast.info("No folders found matching your search")
      }
    } catch (error) {
      toast.error("Error searching folders")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle enter key in search input
  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      handleSearch()
    }
  }

  // Update the filtered conversations logic to use search results when available
  const displayedConversations = searchResults.length > 0 
    ? searchResults 
    : conversationsData

  const handleCreateFolder = () => {
    setShowCreateDialog(true)
  }

  return (
    <>
      <ShadcnSidebar className="border-r h-full w-min-[200px]">
        <div className="px-4 py-3 border-b flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">CloudChat</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            title={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
          >
            {state === "expanded" ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        <SidebarHeader className="p-4 flex items-center justify-between">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search folders..."
              className={`w-full pl-8 h-9 ${showSearchButton ? 'pr-10' : ''}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchInputKeyDown}
            />
            {showSearchButton && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 h-7 w-7"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="flex justify-between items-center">
              {searchResults.length > 0 ? `Search Results (${searchResults.length})` : 'Folders'}
              {searchResults.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs" 
                  onClick={() => {
                    setSearchTerm('')
                    setSearchResults([])
                  }}
                >
                  Clear
                </Button>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-[calc(100vh-180px)]">
                {isLoadingConversations || isSearching ? (
                  <div className="px-4 py-4">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    {error ? (
                      <div className="p-4">
                        <Alert variant="destructive">
                          <AlertTitle>Error loading conversations</AlertTitle>
                          <AlertDescription>{error.message || "Failed to load conversations"}</AlertDescription>
                        </Alert>
                      </div>
                    ) : displayedConversations && Array.isArray(displayedConversations) && displayedConversations.length > 0 ? (
                      <SidebarMenu>
                        {displayedConversations.map((conv: any) => (
                          <SidebarMenuItem key={conv.id} className="mb-2 pb-2 border-b border-gray-100">
                            <FolderItem 
                              id={conv.id} 
                              name={conv.title} 
                              onDelete={handleConversationDeleted}
                            />
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    ) : (
                      <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                        <Folder className="h-12 w-12 text-muted-foreground/60" />
                        <h3 className="font-medium">
                          {searchResults.length === 0 && searchTerm 
                            ? "No folders match your search" 
                            : "No conversations yet"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {searchResults.length === 0 && searchTerm
                            ? "Try a different search term"
                            : "Get started by creating your first conversation."}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <Button variant="default" className="w-full" onClick={handleCreateFolder}>
            <Folder className="mr-2 h-4 w-4" />
            Create New Folder
          </Button>
        </SidebarFooter>
      </ShadcnSidebar>

      <CreateConversationDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  )
}
