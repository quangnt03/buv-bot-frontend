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
import { Trash2, AlertCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Trash } from "lucide-react"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useDeleteConversation } from "@/hooks/use-conversations"

interface DeleteConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  folderName: string
  isLoading: boolean
  hasItems?: boolean
}

export function DeleteConversationDialog({
  open,
  onOpenChange,
  onConfirm,
  folderName,
  isLoading,
  hasItems = false
}: DeleteConversationDialogProps) {
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  
  // Focus the delete button when the dialog opens for better keyboard usage
  useEffect(() => {
    if (open && deleteButtonRef.current && !hasItems) {
      setTimeout(() => {
        deleteButtonRef.current?.focus()
      }, 50)
    }
  }, [open, hasItems])
  
  const handleConfirm = async () => {
    if (isLoading || hasItems) return
    await onConfirm()
  }
  
  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && !hasItems) {
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
            <Trash2 className="h-5 w-5" />
            {hasItems ? "Cannot Delete Folder" : "Delete Folder"}
          </DialogTitle>
          <DialogDescription className="pt-2 space-y-2">
            {hasItems ? (
              <>
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Action Blocked:</strong> The folder &quot;{folderName}&quot; contains items and cannot be deleted.
                  </AlertDescription>
                </Alert>
                <p className="mt-4">
                  You must first remove all items from this folder before it can be deleted.
                </p>
              </>
            ) : (
              <>
                <p>
                  Are you sure you want to delete <span className="font-medium">{folderName}</span>?
                </p>
                <div className="mt-2 bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    <li>This action cannot be undone</li>
                    <li>All associated files will be permanently removed</li>
                    <li>All conversations and chat history will be lost</li>
                  </ul>
                </div>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">
              {hasItems ? "Close" : "Cancel"}
            </Button>
          </DialogClose>
          {!hasItems && (
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              disabled={isLoading}
              ref={deleteButtonRef}
            >
              {isLoading ? "Deleting..." : "Delete Folder"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 