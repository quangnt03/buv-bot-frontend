"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useUpdateItem } from "@/hooks/use-items"
import { formatDate } from "@/lib/utils"
import { Item } from "@/types/api"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { itemsKeys } from "@/hooks/use-items"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"

interface EditItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: Item
}

export function EditItemDialog({ open, onOpenChange, item }: EditItemDialogProps) {
  const [fileName, setFileName] = useState(item.file_name)
  const [isUpdating, setIsUpdating] = useState(false)
  const updateItemMutation = useUpdateItem()
  const queryClient = useQueryClient()
  
  // Reset form when dialog opens with item data
  useEffect(() => {
    if (open && item) {
      setFileName(item.file_name)
    }
  }, [open, item])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileName.trim()) return
    
    try {
      setIsUpdating(true)
      
      // Call the updateItem mutation to update the file name
      await updateItemMutation.mutateAsync({
        itemId: item.id,
        data: {
          file_name: fileName.trim()
        }
      })
      
      // Show success message
      toast.success("Item updated successfully")
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: itemsKeys.detail(item.id) })
      
      // If the item has a conversation ID, invalidate conversation queries too
      if (item.conversation_id) {
        queryClient.invalidateQueries({ 
          queryKey: itemsKeys.conversation(item.conversation_id) 
        })
      }
      
      // Close dialog
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to update item")
    } finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="fileName">File Name</Label>
              <Input 
                id="fileName"
                placeholder="Enter file name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
            
            {/* Display other read-only properties */}
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-medium">Item Details</h3>
              <div className="bg-muted/40 p-3 rounded-md text-sm space-y-2">
                <div>
                  <span className="font-medium">ID:</span> {item.id}
                </div>
                <div>
                  <span className="font-medium">MIME Type:</span> {item.mime_type}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {formatDate(item.last_updated)}
                </div>
              </div>
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
              disabled={!fileName.trim() || isUpdating}
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}