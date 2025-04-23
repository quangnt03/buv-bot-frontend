"use client"

import { useState } from "react"
import { Pencil, Trash2, FileText, File, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDeleteItem, useUpdateItem } from "@/hooks/use-items"
import { Switch } from "@/components/ui/switch"
import { Item } from "@/types/api"
import { DeleteItemDialog } from "@/components/dashboard/delete-item-dialog"
import { EditItemDialog } from "@/components/dashboard/edit-item-dialog"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { ItemIcon } from "../icons"

interface ChatSidebarItemProps {
  item: Item
  onUpdate?: () => void
  onDelete?: () => void
  isLastItem?: boolean
}

export function ChatSidebarItem({ item, onUpdate, onDelete, isLastItem = false }: ChatSidebarItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const deleteItemMutation = useDeleteItem()
  const updateItemMutation = useUpdateItem()
  
  const { id, file_name: fileName, mime_type: mimeType } = item

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }
  
  const confirmDelete = async () => {
    try {
      await deleteItemMutation.mutateAsync({ 
        itemId: id, 
        permanent: true 
      })
      
      setShowDeleteDialog(false)
      toast.success("File deleted successfully")
      
      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      toast.error("Failed to delete file")
    }
  }
  
  const handleToggleActive = async () => {
    if (isUpdating) return
    
    try {
      setIsUpdating(true)
      
      await updateItemMutation.mutateAsync({
        itemId: id,
        data: {
          active: !item.active
        }
      })
      
      toast.success(`File ${!item.active ? 'activated' : 'deactivated'} successfully`)
      
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      toast.error("Failed to update file status")
    } finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <>
      <div className={`transition-colors hover:bg-muted group ${!isLastItem ? 'border-b' : ''}`}>
        {/* Main file info row with icon and name */}
        <div className="flex items-center p-3 pb-2">
          <div className="flex items-center flex-1 gap-3 overflow-hidden">
            <ItemIcon />
            <div className="overflow-hidden">
              <div className="font-medium truncate" title={fileName}>{fileName}</div>
              <div className="flex items-center mt-1">
                <Badge 
                  variant={item.active ? "default" : "outline"} 
                  className={`text-xs px-2 py-0 h-5 ${item.active ? 'bg-green-500 hover:bg-green-500/90' : 'text-muted-foreground'}`}
                >
                  {item.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons row */}
        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 group-hover:bg-muted/80">
          <Button
            variant="ghost"
            size="sm"
            className={`text-xs ${item.active ? 'text-orange-500 hover:text-orange-600' : 'text-green-500 hover:text-green-600'}`}
            onClick={handleToggleActive}
            disabled={isUpdating}
          >
            {item.active ? (
              <>
                <ToggleRight className="h-4 w-4 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 mr-1" />
                Activate
              </>
            )}
          </Button>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <DeleteItemDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        itemName={fileName}
        isLoading={deleteItemMutation.isPending}
      />
      
      {/* Edit item dialog */}
      {item && (
        <EditItemDialog
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open)
            if (!open && onUpdate) {
              onUpdate()
            }
          }}
          item={item}
        />
      )}
    </>
  )
} 