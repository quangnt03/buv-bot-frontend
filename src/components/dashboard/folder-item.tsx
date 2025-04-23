"use client"

import { Folder, PenSquare, Trash2 } from "lucide-react"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useConversationStore } from "@/store/conversation-store"
import { useState } from "react"
import { useDeleteConversation, useConversation } from "@/hooks/use-conversations"
import { DeleteConversationDialog } from "./delete-conversation-dialog"
import { useItemsByConversationId } from "@/hooks/use-items"
import { CreateConversationDialog } from "./create-conversation-dialog"
import { useToast } from "@/hooks/use-toast"
import { makeApiCall } from "@/lib/make-api-call"
import { Conversation, ConversationResponse } from "@/types/api"

interface FolderItemProps {
  id: string
  name: string
  onDelete?: () => void
}

export function FolderItem({ id, name, onDelete }: FolderItemProps) {
  const { selectConversation, selectedConversationId } = useConversationStore()
  const deleteConversationMutation = useDeleteConversation()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()
  const [editDialogData, setEditDialogData] = useState<{id: string, title: string, context?: string}>()
  
  // Fetch items for this conversation to check if it has any
  const { data: conversationItems, isLoading: isItemsLoading } = useItemsByConversationId(id)
  const hasItems = conversationItems && conversationItems.length > 0
  
  // Fetch full conversation details
  const { data: conversationData, refetch: refetchConversation } = useConversation(id)
  
  // Log conversation data whenever it changes

  const handleSelect = () => {
    selectConversation(id)
  }

  const handleEdit = async () => {
    // Make sure we have the latest conversation data before editing
    try {      
      // Make a direct API call to get the fresh conversation data
      const freshConversationResponse = await makeApiCall<Conversation>({
        baseUrl: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL,
        method: "GET",
        path: `api/v1/conversation/${id}`,
        requiresAuth: true
      })
      const freshConversation = freshConversationResponse.data
       
      // Prepare the data for the edit dialog - ensuring we have the context
      const dialogData = {
        id,
        title: freshConversation?.title || name,
        context: freshConversation?.context || ""
      }
      
      // Store the fresh data for the dialog
      setEditDialogData(dialogData)
      
      // Open the edit dialog with the fresh data
      setShowEditDialog(true)
    } catch (error) {
      console.error("Error fetching conversation data:", error)
      toast({
        title: "Could not load folder details for editing",
        description: "Please try again later",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async () => {
    // Open the delete confirmation dialog
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    // Don't allow deletion if folder has items
    if (hasItems) return
    
    try {
      await deleteConversationMutation.mutateAsync(id)
      // Close the dialog after deletion is complete
      setShowDeleteDialog(false)
      
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      // Error handling without logging
    }
  }

  const isSelected = selectedConversationId === id
  return (
    <>
      <SidebarMenuButton 
        asChild 
        className={`w-full justify-between py-3 ${isSelected ? 'border-b border-primary/40 pb-2' : ''}`}
        isActive={isSelected} 
        onClick={handleSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 py-3">
            <div className="relative">
              <Folder className="h-4 w-4" />
            </div>
            <span className="text-l font-medium leading-tight line-clamp-2">{name}</span>
          </div>
          <div className={`flex items-center transition-opacity py-3 duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleEdit()
              }}
              title="Edit folder"
            >
              <PenSquare className="h-4 w-4" />
              <span className="sr-only">Edit folder</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              disabled={hasItems || isItemsLoading}
              title={hasItems ? "Cannot delete folders with items" : "Delete folder"}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete folder</span>
            </Button>
          </div>
        </div>
      </SidebarMenuButton>

      {/* Edit Dialog */}
      <CreateConversationDialog
        open={showEditDialog}
        onOpenChange={(isOpen) => {
          setShowEditDialog(isOpen)
          if (!isOpen) {
            // Clear edit dialog data when closing
            setEditDialogData(undefined)
          }
        }}
        editMode={true}
        existingConversation={editDialogData || {
          id,
          title: name,
          context: conversationData?.context
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConversationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        folderName={name}
        isLoading={deleteConversationMutation.isPending}
        hasItems={hasItems}
      />
    </>
  )
}