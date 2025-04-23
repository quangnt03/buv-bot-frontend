"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateConversation, useUpdateConversation } from "@/hooks/use-conversations"
import { useConversationStore } from "@/store/conversation-store"
import { toast } from "sonner"

interface CreateConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConversationCreated?: (conversation: any) => void
  editMode?: boolean
  existingConversation?: {
    id: string
    title: string
    context?: string
  }
}

export function CreateConversationDialog({ 
  open, 
  onOpenChange,
  onConversationCreated,
  editMode = false,
  existingConversation
}: CreateConversationDialogProps) {
  const [title, setTitle] = useState("")
  const [context, setContext] = useState("")
  const createConversationMutation = useCreateConversation()
  const updateConversationMutation = useUpdateConversation()

  // Initialize form with existing data when in edit mode
  useEffect(() => {
    if (open && editMode && existingConversation) {
      setTitle(existingConversation.title || "")
      // Only set context if it's a non-empty string
      if (existingConversation.context && typeof existingConversation.context === 'string') {
        setContext(existingConversation.context)
      } else {
        setContext("")
      }
    } else if (open && !editMode) {
      // Reset when opening in create mode
      setTitle("")
      setContext("")
    }
  }, [open, editMode, existingConversation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      if (editMode && existingConversation) {
        // Prepare update data with proper handling of the context
        const updateData = {
          title: title.trim(),
          context: context.trim()
        }

        
        // Update existing conversation
        const result = await updateConversationMutation.mutateAsync({
          conversationId: existingConversation.id,
          data: updateData
        })
        
        // Check if we have a valid result
        if (!result) {
          throw new Error("No response from server")
        }
        
        toast.success("Folder updated successfully")
        
        // Close the dialog right away without passing potentially undefined data
        onOpenChange(false)
        
        // We'll use the existing conversation ID since that's what we know for sure
        if (onConversationCreated && result) {
          onConversationCreated({
            ...result,
            id: existingConversation.id // Ensure ID is present
          })
        }
      } else {
        // Create new conversation
        const newConversation = await createConversationMutation.mutateAsync({
          title: title.trim(),
          context: context.trim() || "New conversation"
        })
        
        toast.success("Folder created successfully")
        
        // Call the callback with the new conversation
        if (onConversationCreated) {
          onConversationCreated(newConversation)
        } else {
          onOpenChange(false)
        }
      }
      
      // Reset form
      setTitle("")
      setContext("")
    } catch (error) {
      console.error("Folder operation error:", error)
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes("undefined")) {
          toast.error(`Failed to ${editMode ? "update" : "create"} folder: Server returned invalid response`)
        } else {
          toast.error(`Failed to ${editMode ? "update" : "create"} folder: ${error.message}`)
        }
      } else {
        toast.error(`Failed to ${editMode ? "update" : "create"} folder: Unknown error`)
      }
    }
  }

  // Is the mutation loading?
  const isLoading = editMode 
    ? updateConversationMutation.isPending 
    : createConversationMutation.isPending

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Only allow closing if no operation is in progress
        if (!isLoading) {
          onOpenChange(isOpen)
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Folder" : "Create New Folder"}</DialogTitle>
          {(useConversationStore.getState().conversations.length > 0 || editMode) && !isLoading && (
            <DialogClose className="absolute right-4 top-4" />
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                placeholder="Folder title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9"
                autoFocus
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="context">Description (Optional)</Label>
              <Textarea
                id="context"
                placeholder="Add some details about this folder..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <DialogFooter>
            {(useConversationStore.getState().conversations.length > 0 || editMode) && (
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                type="button"
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={!title.trim() || isLoading}
            >
              {isLoading 
                ? (editMode ? "Updating..." : "Creating...")
                : (editMode ? "Update" : "Create")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
