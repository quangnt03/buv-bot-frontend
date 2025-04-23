"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDeleteItem, useUpdateItem, useItem } from "@/hooks/use-items"
import { DeleteItemDialog } from "./delete-item-dialog"
import { formatDate } from "@/lib/utils"
import { Item } from "@/types/api"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { itemsKeys } from "@/hooks/use-items"
import { EditItemDialog } from "./edit-item-dialog"
import { ItemIcon } from "../icons"

interface FileItemProps {
  item: Item
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function FileItem({ item, onEdit, onDelete }: FileItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const deleteItemMutation = useDeleteItem()
  const updateItemMutation = useUpdateItem()
  const queryClient = useQueryClient()
  
  // For retrieving fresh data if needed
  const { refetch } = useItem(item.id)
  
  const { id, file_name: fileName } = item
  

  const handleDelete = () => {
    // Show the delete confirmation dialog
    setShowDeleteDialog(true)
  }
  
  const confirmDelete = async () => {
    try {
      // Call the deleteItem mutation
      await deleteItemMutation.mutateAsync({ 
        itemId: id, 
        permanent: true 
      })
      
      // Close the dialog
      setShowDeleteDialog(false)
      
      // Notify parent component about deletion with a small delay
      // to ensure backend has time to process the deletion
      setTimeout(() => {
        if (onDelete) {
          onDelete(id)
        }
      }, 300)
    } catch (error) {
      // Error handling without logging
      // Keep dialog open on error
    }
  }
  
  const handleToggleActive = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      // Call the updateItem mutation to toggle the active status
      await updateItemMutation.mutateAsync({
        itemId: id,
        data: {
          active: !item.active
        }
      });
      
      // Show success message
      toast.success(`Item ${!item.active ? 'activated' : 'deactivated'} successfully`);
      
      // If the expanded view is open, refetch to get updated item data
      if (expanded) {
        // Invalidate the cached data for this item
        queryClient.invalidateQueries({ queryKey: itemsKeys.detail(id) });
        
        // Refetch the item data
        await refetch();
        
        // Also invalidate any conversation-related queries that might include this item
        if (item.conversation_id) {
          queryClient.invalidateQueries({ 
            queryKey: itemsKeys.conversation(item.conversation_id) 
          });
        }
      }
    } catch (error) {
      toast.error(`Failed to update item status`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col border rounded-md bg-background hover:border-primary/50 transition-colors">
        <div className="flex items-center p-3">
          <div className="flex items-center flex-1 gap-2">

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-3">
              <ItemIcon />
              <span className="font-medium">{fileName}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Switch
                      checked={item.active}
                      onCheckedChange={handleToggleActive}
                      disabled={isUpdating}
                      aria-label={item.active ? "Deactivate item" : "Activate item"}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.active ? "Deactivate item" : "Activate item"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Expandable details section as a table */}
        {expanded && (
          <div className="px-6 pb-3 pt-2 border-t bg-muted/30 rounded-b-md">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold w-1/3 py-1.5">Filename</TableCell>
                  <TableCell className="py-1.5">{item.file_name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold w-1/3 py-1.5">MIME Type</TableCell>
                  <TableCell className="py-1.5">{item.mime_type}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold w-1/3 py-1.5">URI</TableCell>
                  <TableCell className="py-1.5">{item.uri}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold w-1/3 py-1.5">Last Updated</TableCell>
                  <TableCell className="py-1.5">{formatDate(item.last_updated)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold w-1/3 py-1.5">Active</TableCell>
                  <TableCell className="py-1.5">{item.active ? "Yes" : "No"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
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
          }}
          item={item}
        />
      )}
    </>
  )
}
