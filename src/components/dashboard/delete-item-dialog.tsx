"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, FileX } from "lucide-react"
import { useEffect, useRef } from "react"

interface DeleteItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  itemName: string
  isLoading: boolean
}

export function DeleteItemDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  isLoading
}: DeleteItemDialogProps) {
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  
  // Focus the delete button when the dialog opens for better keyboard usage
  useEffect(() => {
    if (open && deleteButtonRef.current) {
      setTimeout(() => {
        deleteButtonRef.current?.focus()
      }, 50)
    }
  }, [open])
  
  const handleConfirm = async () => {
    if (isLoading) return
    await onConfirm()
  }
  
  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault()
      handleConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <FileX className="h-5 w-5" />
            Delete Item
          </DialogTitle>
          <DialogDescription className="pt-2 space-y-2">
            <p>
              Are you sure you want to delete <span className="font-medium">{itemName}</span>?
            </p>
            <div className="mt-2 bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              <ul className="list-disc list-inside space-y-1">
                <li>This action cannot be undone</li>
                <li>The file will be permanently removed</li>
                <li>Links to this file in chat history will no longer work</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isLoading}
            ref={deleteButtonRef}
          >
            {isLoading ? "Deleting..." : "Delete Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

