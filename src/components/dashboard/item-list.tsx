"use client"

import { useEffect } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileItem } from "./file-item"
import { Item } from "@/types/api"

interface ItemListProps {
  conversationItems: Item[];
  conversationTitle?: string;
  onAddItem: () => void;
  onEditItem?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
}

export function ItemList({ 
  conversationItems, 
  conversationTitle = "Folder",
  onAddItem,
  onEditItem,
  onDeleteItem
}: ItemListProps) {
  // Extra safety check for empty items array
  const hasItems = !!(conversationItems && conversationItems?.length > 0);

  // Safe access to items array with fallback
  const items = conversationItems || [];

  return (
    hasItems ? (
      <ScrollArea className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            {conversationTitle} Items ({items.length})
          </h1>
        </div>

        <div className="space-y-2 w-full">
          {items.length > 0 ? (
            items.map((item) => (
              <FileItem 
                key={item.id}
                item={item}
                onEdit={(id) => onEditItem?.(id)}
                onDelete={(id) => onDeleteItem?.(id)}
              />
            ))
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              No items to display
            </div>
          )}
        </div>
      </ScrollArea>
  ): (
    <div className="flex flex-col items-center justify-center h-full w-full text-center p-4">
      <h2 className="text-xl font-medium mb-2">This folder is empty</h2>
      <p className="text-muted-foreground mb-4">Add your first item to get started</p>
      <Button onClick={onAddItem}>
        <PlusCircle className="mr-2 h-4 w-4" />
        New Item
      </Button>
    </div>
  ));
} 