"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useItemsStore } from "@/store/item-store"
import { useConversationStore } from "@/store/conversation-store"
import { useChatStore } from "@/store/chat-store"
import { useItemsByConversationId, useDeleteItem } from "@/hooks/use-items"
import { useConversation, useConversations, useDeleteConversation } from "@/hooks/use-conversations"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AddItemDialog } from "./add-item-dialog"
import { Pagination } from "./pagination"
import { Item } from "@/types/api"
import { useQueryClient } from "@tanstack/react-query"
import { itemsKeys } from "@/hooks/use-items"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ChatButton } from "@/components/chat/chat-button"

// Import our new components
import { SearchBar } from "./search-bar"
import { ItemList } from "./item-list"

export function MainContent() {
  const { 
    searchValue, 
    setSearchValue, 
    selectedFilter, 
    setSelectedFilter, 
    items,
    setItems, 
    refreshTrigger, 
    setRefreshTrigger 
  } = useItemsStore()
  const { selectedConversationId } = useConversationStore()
  const { setActiveConversationId } = useChatStore()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Add a refresh key to force re-render
  const [isDataReady, setIsDataReady] = useState(false) // Track when data is fully ready
  const [showEmptyFolderDialog, setShowEmptyFolderDialog] = useState(false)
  
  const queryClient = useQueryClient()
  
  const deleteConversationMutation = useDeleteConversation()
  
  const router = useRouter()
  
  // Fetch all conversations (folders)
  const {
    data: conversationsData,
    isLoading: isConversationsLoading,
    isFetched: isConversationsFetched
  } = useConversations()

  // Fetch the selected conversation details
  const { 
    data: conversationData, 
    isLoading: isConversationLoading, 
    isFetched: isConversationFetched 
  } = useConversation(selectedConversationId || '')

  // Fetch items for the selected conversation - only runs if selectedConversationId exists
  const { 
    data: conversationItems, 
    isLoading: isItemsLoading, 
    isFetched: isItemsFetched, 
    refetch: refetchItems 
  } = useItemsByConversationId(selectedConversationId || undefined)

  // Listen for refreshTrigger changes to refetch items
  useEffect(() => {
    if (selectedConversationId) {
      // Force an immediate refetch
      refetchItems({
        cancelRefetch: false,
        throwOnError: false
      })
      .then(() => {
        // After successful refetch, increment refresh key to force re-render
        setRefreshKey(prev => prev + 1);
      })
      .catch(() => {
        // On error, try again after a short delay
        setTimeout(() => {
          refetchItems();
          setRefreshKey(prev => prev + 1);
        }, 500);
      });
    }
  }, [refreshTrigger, selectedConversationId, refetchItems]);

  // Check if all data is ready
  useEffect(() => {
    // We consider data ready when:
    // 1. All conversations (folders) have been fetched
    // 2. The selected conversation details have been fetched
    // 3. The items for the selected conversation have been fetched
    // 4. None of the above are currently loading
    const dataReady = isConversationsFetched &&
                      isConversationFetched && 
                      isItemsFetched && 
                      !isConversationsLoading &&
                      !isConversationLoading && 
                      !isItemsLoading;
    
    setIsDataReady(dataReady);
  }, [
    conversationsData,
    conversationData, 
    conversationItems, 
    isConversationsLoading,
    isConversationLoading, 
    isItemsLoading, 
    isConversationsFetched,
    isConversationFetched, 
    isItemsFetched
  ]);

  // Synchronize React Query data with Zustand store when items change
  useEffect(() => {
    if (conversationItems && Array.isArray(conversationItems)) {
      try {
        // Map the API items to the format expected by the Zustand store
        const formattedItems = conversationItems.map((item) => ({
          id: item.id,
          name: item.file_name,
          type: item.mime_type.includes('google') ? 'google-drive' as const : 
                item.mime_type.includes('dropbox') ? 'dropbox' as const : 's3' as const,
        }));
        
        // Update the Zustand store with the new items
        setItems(formattedItems);
        
        // Force a component re-render
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        // Error handling without console.log
      }
    }
  }, [conversationItems, setItems]);

  // Add a refresh mechanism when dialog closes (in case items were added)
  useEffect(() => {
    if (!showAddDialog) {
      // Dialog was just closed, implement multiple refetch attempts
      // with increasing delays to handle possible race conditions
      const refetchDelays = [100, 600, 1500, 3000];
      
      refetchDelays.forEach(delay => {
        setTimeout(() => {
          // Attempt refetch with each delay
          refetchItems()
            .then(() => {
              // Force a refresh after refetch completes
              setRefreshKey(prev => prev + 1);
            })
            .catch(err => {
              // Error handling without console.log
            });
        }, delay);
      });
    }
  }, [showAddDialog, refetchItems]);

  const filters = ["All", "Google Drive", "DropBox"]

  // Add a function to force data refresh
  const forceDataRefresh = (conversationId: string) => {
    // First invalidate queries
    queryClient.invalidateQueries({ 
      queryKey: itemsKeys.conversation(conversationId)
    });
    
    // Reset query cache to force a fresh fetch
    queryClient.resetQueries({
      queryKey: itemsKeys.conversation(conversationId),
      exact: true
    });
    
    // Then explicitly refetch to ensure UI updates
    setTimeout(() => {
      queryClient.refetchQueries({ 
        queryKey: itemsKeys.conversation(conversationId),
        exact: true, // Refetch both active and inactive queries
        type: 'all',
        stale: true, // Refetch even stale queries
      }).catch(() => {
        // Error handling without logging
      });
      
      // Trigger refresh in the store
      setRefreshTrigger(Date.now());
    }, 300);

    // Double-check refetch after a delay
    setTimeout(() => {
      queryClient.refetchQueries({ 
        queryKey: itemsKeys.conversation(conversationId),
        exact: true
      });
      
      // Update the UI
      setRefreshKey(prev => prev + 1);
    }, 1000);
  };

  // Add a new function to check if a folder is empty and handle deletion
  const checkAndHandleEmptyFolder = async () => {
    if (selectedConversationId && conversationItems && Array.isArray(conversationItems)) {
      // Check if the conversation has no items
      if (conversationItems.length === 0) {
        // Show confirmation dialog
        setShowEmptyFolderDialog(true)
      }
    }
  }
  
  // Add a function to delete the empty conversation
  const deleteEmptyConversation = async () => {
    if (!selectedConversationId) return
    
    try {
      await deleteConversationMutation.mutateAsync(selectedConversationId)
      toast.success("Empty folder deleted successfully")
      // Dialog will close automatically
    } catch (error) {
      toast.error("Failed to delete empty folder")
    }
  }

  // Enhance the handleDeleteItem function to check for empty folders after deletion
  const handleDeleteItem = (itemId: string) => {
    // Force a refresh of the items data
    if (selectedConversationId) {
      // Immediate refresh
      forceDataRefresh(selectedConversationId);
      
      // Additional refreshes to ensure UI consistency
      const refreshDelays = [500, 1500, 3000];
      refreshDelays.forEach(delay => {
        setTimeout(() => {
          forceDataRefresh(selectedConversationId);
          
          // After final refresh, check if folder is empty
          if (delay === refreshDelays[refreshDelays.length - 1]) {
            setTimeout(() => {
              checkAndHandleEmptyFolder();
            }, 300);
          }
        }, delay);
      });
    }
  };

  const handleStartChat = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (selectedConversationId) {
      setActiveConversationId(selectedConversationId)
      // Navigate to the chat page for the selected conversation
      router.push(`/chat/${selectedConversationId}`)
    } else {
      toast.error("Please select a folder first")
    }
  }

  // Filter items based on search and selected filter
  const filteredItems = items.filter((item) => {
    const matchesSearch = searchValue ? item.name.toLowerCase().includes(searchValue.toLowerCase()) : true
    const matchesFilter = selectedFilter === "All" ? true : item.type === selectedFilter.toLowerCase().replace(" ", "-")
    return matchesSearch && matchesFilter
  })

  // Add a new state for search results
  const [itemSearchResults, setItemSearchResults] = useState<Item[]>([]);

  // Folders are still loading, show loading state
  if (isConversationsLoading || !isConversationsFetched) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full text-center p-4">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Loading folders...</p>
      </div>
    )
  }

  // Folders are loaded but no conversation is selected
  if (!selectedConversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full text-center p-4">
        <h2 className="text-xl font-medium mb-2">No folder selected</h2>
        <p className="text-muted-foreground">Select a folder from the sidebar to view its contents</p>
      </div>
    )
  }

  // Loading state - show until both conversation and items are fully loaded
  if (!isDataReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full text-center p-4">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Loading folder contents...</p>
      </div>
    )
  }

  // Ensure we have valid data before rendering the main content
  if (!conversationItems) {
    return null; // Default fallback if we somehow get here without data
  }

  return (
    <>
      <div key={refreshKey} className="flex-1 flex flex-col h-full bg-background">
        {(conversationItems && conversationItems.length > 0) && (
          <Card className="rounded-none border-0 border-b shadow-none">
            <CardContent className=" items-center">
              <div className="flex items-center justify-between gap-4 pt-4">
                {/* SearchBar component */}
                <div className="flex-1">
                  <SearchBar 
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                    filters={filters}
                    onSearchResults={setItemSearchResults}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                  <ChatButton 
                    conversationId={selectedConversationId} 
                    onClick={handleStartChat}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      }

        {/* ItemList component - only render when all data is ready */}
        <div key={`items-${refreshKey}`} className="flex-1">
          <ItemList 
            conversationItems={itemSearchResults.length > 0 ? itemSearchResults : (conversationItems || [])}
            conversationTitle={itemSearchResults.length > 0 
              ? `Search Results in ${conversationData?.title} (${itemSearchResults.length})` 
              : conversationData?.title}
            onAddItem={() => setShowAddDialog(true)}
            onEditItem={(id) => {
              // Force refresh when an item is edited
              setRefreshKey(prev => prev + 1);
            }}
            onDeleteItem={handleDeleteItem}
          />
        </div>

        <div className="p-4 flex justify-center border-t">
          <Pagination currentPage={1} totalPages={Math.ceil(filteredItems.length / 10)} />
        </div>
      </div>

      <AddItemDialog 
        open={showAddDialog} 
        onOpenChange={(isOpen) => {
          // Update local state
          setShowAddDialog(isOpen);
          
          // If dialog is closing, force a comprehensive refresh
          if (!isOpen) {
            // Start with an immediate attempt
            refetchItems().catch(() => {});
            
            // Then implement a sequence of refetch attempts
            const refreshSequence = [200, 700, 1500, 3000, 5000];
            refreshSequence.forEach(delay => {
              setTimeout(() => {
                // First refetch the data
                refetchItems()
                  .then(() => {
                    // Then force UI to refresh with new data
                    setRefreshKey(prev => prev + 1);
                  })
                  .catch(() => {
                    // On error, just try to update the refresh key anyway
                    setRefreshKey(prev => prev + 1);
                  });
              }, delay);
            });
          }
        }} 
      />
      
      {/* Alert Dialog for Empty Folder Deletion */}
      <AlertDialog open={showEmptyFolderDialog} onOpenChange={setShowEmptyFolderDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Empty Folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This folder is now empty. Would you like to delete it?
              <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 text-sm">
                <p>Deleting this folder will permanently remove it from your account.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Empty Folder</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteEmptyConversation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteConversationMutation.isPending ? "Deleting..." : "Delete Folder"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 