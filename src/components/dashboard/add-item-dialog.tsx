"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUploadFile } from "@/hooks/use-upload"
import { useConversationStore } from "@/store/conversation-store"
import { useItemsStore } from "@/store/item-store" 
import { toast } from "sonner"
import { itemsKeys } from "@/hooks/use-items"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddItemDialog({ open, onOpenChange }: AddItemDialogProps) {
  const [driveLink, setDriveLink] = useState("")
  const { selectedConversationId } = useConversationStore()
  const { setRefreshTrigger } = useItemsStore()
  const uploadMutation = useUploadFile()
  const queryClient = useQueryClient()

  // Reset input when dialog opens
  useEffect(() => {
    if (open) {
      setDriveLink("")
    }
  }, [open])

  // Force data refresh when file is uploaded
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
        exact: true, 
        type: 'all', // Refetch both active and inactive queries
        stale: true, // Refetch even stale queries
      }).catch(err => {
        // Error handling without logging
      });
      
      // Add an additional refresh trigger if store has that method
      if (setRefreshTrigger) {
        setRefreshTrigger(Date.now());
      }
    }, 500);

    // Double-check refetch after a delay
    setTimeout(() => {
      queryClient.refetchQueries({ 
        queryKey: itemsKeys.conversation(conversationId),
        exact: true
      });
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!driveLink.trim()) return
    
    if (!selectedConversationId) {
      toast.error("No folder selected")
      return
    }

    try {
      await uploadMutation.mutateAsync({
        driver_id: driveLink.trim(),
        conversation_id: selectedConversationId
      })
      
      // Force immediate refetch of the conversation items
      forceDataRefresh(selectedConversationId);
      
      toast.success("File added successfully")
      setDriveLink("")
      
      // Close dialog with a slight delay to allow refetch to begin
      setTimeout(() => {
        onOpenChange(false)
      }, 100);
      
      // Set a more aggressive refresh sequence to ensure data is updated
      const refreshIntervals = [800, 1500, 3000];
      refreshIntervals.forEach(delay => {
        setTimeout(() => {
          forceDataRefresh(selectedConversationId);
        }, delay);
      });
    } catch (error) {
      toast.error("Failed to add file: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Always call the parent's onOpenChange function first
      onOpenChange(isOpen);
      
      // If dialog is closing and there's a selected conversation, force a refresh
      if (!isOpen && selectedConversationId) {
        // More aggressive refresh strategy when dialog closes
        const refreshDelays = [100, 500, 1000, 2000];
        refreshDelays.forEach(delay => {
          setTimeout(() => {
            if (!uploadMutation.isPending) {
              forceDataRefresh(selectedConversationId);
              
              // Also set the refresh trigger if available
              if (setRefreshTrigger) {
                setRefreshTrigger(Date.now());
              }
            }
          }, delay);
        });
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="driveLink">Google Drive Link</Label>
              <Textarea 
                id="driveLink"
                placeholder="https://drive.google.com/file/..."
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                className="min-h-[100px] resize-none"
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              type="button"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!driveLink.trim() || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
