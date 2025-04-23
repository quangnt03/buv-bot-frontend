"use client"

import { useState } from "react"
import { useItemsByConversationId, useUpdateItem, useDeleteItem } from "@/hooks/use-items"
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Home, Plus, MoreVertical, Edit, Trash, ToggleLeft, ToggleRight, PanelLeftClose, PanelLeft } from "lucide-react"
import Link from "next/link"
import { useConversationStore } from "@/store/conversation-store"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Item } from "@/types/api"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { AddItemDialog } from "@/components/dashboard/add-item-dialog"
import { EditItemDialog } from "@/components/dashboard/edit-item-dialog"
import { ItemIcon } from "../icons"
import { cn } from "@/lib/utils"

interface ChatSidebarProps {
  conversationId: string
  conversationTitle?: string
}

export function ChatSidebar({ conversationId, conversationTitle }: ChatSidebarProps) {
  const router = useRouter()
  const { conversations } = useConversationStore()
  const updateItemMutation = useUpdateItem()
  const deleteItemMutation = useDeleteItem()
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [showEditItemDialog, setShowEditItemDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const { toggleSidebar, state } = useSidebar()
  
  // Fetch items for the selected conversation
  const { 
    data: conversationItems, 
    isLoading: isItemsLoading,
    refetch: refetchItems
  } = useItemsByConversationId(conversationId)
  
  const hasItems = conversationItems && conversationItems.length > 0
  
  // Handle toggle item active state
  const handleToggleActive = async (item: Item) => {
    if (updatingItemId) return
    
    try {
      setUpdatingItemId(item.id)
      
      await updateItemMutation.mutateAsync({
        itemId: item.id,
        data: {
          active: !item.active
        }
      })
      
      toast.success(`${item.file_name} ${!item.active ? 'activated' : 'deactivated'}`)
      refetchItems()
    } catch (error) {
      toast.error("Failed to update item")
    } finally {
      setUpdatingItemId(null)
    }
  }
  
  // Handle delete item
  const handleDeleteItem = async (item: Item) => {
    if (deletingItemId) return
    
    try {
      setDeletingItemId(item.id)
      
      await deleteItemMutation.mutateAsync({
        itemId: item.id,
        permanent: true
      })
      
      toast.success(`${item.file_name} deleted`)
      refetchItems()
    } catch (error) {
      toast.error("Failed to delete item")
    } finally {
      setDeletingItemId(null)
    }
  }
  
  // Handle edit item - open edit dialog
  const handleEditItem = (item: Item) => {
    setSelectedItem(item)
    setShowEditItemDialog(true)
  }
  
  // Handle add new item - open add item dialog
  const handleAddItem = () => {
    setShowAddItemDialog(true)
  }
  
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="w-80 border-r bg-white text-black">
      <SidebarHeader className={cn("py-4  flex flex-row justify-between items-center border-b", state === "expanded" && "border-b-0 px-4")}>
        {conversationTitle && state === "expanded" && (
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <Home className="h-5 w-5" />
            </Link>
            
              <div className="ml-3 text-gray-900 font-medium max-w-[180px] truncate">
                {conversationTitle}
              </div>
          </div>
        )}
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            title={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
          >
            {state === "expanded" ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </Button>
          
          { state === "expanded" && <Button 
            variant="outline" 
            size="icon" 
            className="bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 rounded-md"
            onClick={handleAddItem}
          >
            <Plus className="h-5 w-5" />
          </Button>
          }
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {isItemsLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner className="text-gray-700" />
          </div>
        ) : hasItems ? (
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="py-2">
              {conversationItems.map((item: Item, index) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "flex items-center justify-between px-4 py-3 border-b-2 border-gray-100 hover:bg-gray-200",
                    "last:border-b-0"
                  )}
                >
                  <div className="flex items-center">
                    <div className={cn("mr-3", !item.active && "opacity-50")}>
                      <ItemIcon />
                    </div>
                    <span 
                      className={cn(
                        "text-sm font-medium truncate max-w-[180px]",
                        !item.active && "text-gray-400"
                      )}
                    >
                      {item.file_name}
                    </span>
                  </div>
                  
                  {/* Dropdown menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-full"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => handleEditItem(item)}
                        className="flex items-center cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => handleToggleActive(item)}
                        className="flex items-center cursor-pointer"
                        disabled={updatingItemId === item.id}
                      >
                        {item.active ? (
                          <>
                            <ToggleRight className="h-4 w-4 mr-2 text-green-500" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 mr-2 text-gray-500" />
                            <span>Activate</span>
                          </>
                        )}
                        {updatingItemId === item.id && (
                          <LoadingSpinner className="h-3 w-3 ml-2" />
                        )}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => handleDeleteItem(item)}
                        className="flex items-center cursor-pointer text-red-600"
                        disabled={deletingItemId === item.id}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        <span>Delete</span>
                        {deletingItemId === item.id && (
                          <LoadingSpinner className="h-3 w-3 ml-2" />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No items available</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 text-gray-700 border-gray-300 hover:bg-gray-100"
              onClick={handleAddItem}
            >
              Add Items
            </Button>
          </div>
        )}
      </SidebarContent>
      
      {/* Add Item Dialog */}
      <AddItemDialog 
        open={showAddItemDialog} 
        onOpenChange={setShowAddItemDialog} 
      />
      
      {/* Edit Item Dialog */}
      {selectedItem && (
        <EditItemDialog 
          open={showEditItemDialog} 
          onOpenChange={(open) => {
            setShowEditItemDialog(open)
            if (!open) {
              // Refetch items list when the dialog closes
              refetchItems()
            }
          }} 
          item={selectedItem}
        />
      )}
    </Sidebar>
  )
} 