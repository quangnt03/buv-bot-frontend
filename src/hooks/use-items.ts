import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { itemsService, type GetItemsParams } from "@/services/items-service"
import type { ItemUpdate, ItemsResponse, Item } from "@/types/api"

// Query keys
export const itemsKeys = {
  all: ["items"] as const,
  lists: () => [...itemsKeys.all, "list"] as const,
  list: (filters: GetItemsParams) => [...itemsKeys.lists(), filters] as const,
  details: () => [...itemsKeys.all, "detail"] as const,
  detail: (id: string) => [...itemsKeys.details(), id] as const,
  conversation: (id: string) => [...itemsKeys.lists(), { conversation_id: id }] as const,
}

// Hooks

export function useItem(itemId: string) {
  return useQuery<Item>({
    queryKey: itemsKeys.detail(itemId),
    queryFn: () => itemsService.getItem(itemId),
    enabled: !!itemId,
  })
}

// For use with conversation_id params
export function useItemByParams(params: GetItemsParams | undefined) {
  return useQuery<Item>({
    queryKey: params ? itemsKeys.list(params) : itemsKeys.lists(),
    queryFn: () => ({} as Item), // Just a placeholder, not actually used
    enabled: !!params?.conversation_id,
  })
}

// Hook specifically for getting items by conversation ID
export function useItemsByConversationId(conversationId?: string) {
  const queryClient = useQueryClient();

  return useQuery<ItemsResponse>({
    queryKey: conversationId ? itemsKeys.conversation(conversationId) : itemsKeys.lists(),
    queryFn: async () => {
      try {
        if (!conversationId) {
          return [];
        }
        const response = await itemsService.getItems({ conversation_id: conversationId });
        return response || []; // ItemsResponse is now already an array
      } catch (error) {
        // Return a valid default array instead of propagating the error
        return [];
      }
    },
    enabled: !!conversationId, // Only run the query if conversationId is provided
    staleTime: 0, // Always consider data stale to ensure fresh fetch
    gcTime: 5000, // Short garbage collection time (renamed from cacheTime in v4+)
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: 3, // Retry failed requests 3 times
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: ItemUpdate }) => itemsService.updateItem(itemId, data),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: itemsKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: itemsKeys.detail(updatedItem.id),
      })
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, permanent }: { itemId: string; permanent?: boolean }) =>
      itemsService.deleteItem(itemId, permanent),
    onSuccess: (_, variables) => {
      // Invalidate all items lists first
      queryClient.invalidateQueries({ queryKey: itemsKeys.lists() })
      
      // Invalidate the specific item
      queryClient.invalidateQueries({
        queryKey: itemsKeys.detail(variables.itemId),
      })
      
      // Get the item's conversation ID from cache if available
      const item = queryClient.getQueryData<Item>(itemsKeys.detail(variables.itemId))
      if (item?.conversation_id) {
        // Invalidate the conversation's items
        queryClient.invalidateQueries({
          queryKey: itemsKeys.conversation(item.conversation_id),
        })
        
        // Also reset the query to force a fresh fetch
        queryClient.resetQueries({
          queryKey: itemsKeys.conversation(item.conversation_id),
        })
      }
    },
    // Add retry options
    retry: 2,
  })
}

export function useDeleteConversationItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, permanent }: { conversationId: string; permanent?: boolean }) =>
      itemsService.deleteConversationItems(conversationId, permanent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsKeys.lists() })
    },
  })
}

export function useConversationItems(params: GetItemsParams | undefined) {
  return useQuery<ItemsResponse>({
    queryKey: params ? itemsKeys.list(params) : itemsKeys.lists(),
    queryFn: async () => {
      if (params) {
        return itemsService.getItems(params); // Returns array of items directly
      }
      return []; // Return empty array as default
    },
    enabled: !!params?.conversation_id,
  })
}

export function useSearchItems() {
  return useMutation({
    mutationFn: async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        return [];
      }
      
      // Search items by title/filename
      return itemsService.getItems({ search: searchTerm.trim() });
    }
  });
}

