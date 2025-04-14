import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { itemsService, type GetItemsParams } from "@/services/items-service"
import type { ItemUpdate } from "@/types/api"

// Query keys
export const itemsKeys = {
  all: ["items"] as const,
  lists: () => [...itemsKeys.all, "list"] as const,
  list: (filters: GetItemsParams) => [...itemsKeys.lists(), filters] as const,
  details: () => [...itemsKeys.all, "detail"] as const,
  detail: (id: string) => [...itemsKeys.details(), id] as const,
}

// Hooks
export function useItems(params?: GetItemsParams) {
  return useQuery({
    queryKey: itemsKeys.list(params || {}),
    queryFn: () => itemsService.getItems(params),
  })
}

export function useItem(itemId: string) {
  return useQuery({
    queryKey: itemsKeys.detail(itemId),
    queryFn: () => itemsService.getItem(itemId),
    enabled: !!itemId,
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
      queryClient.invalidateQueries({ queryKey: itemsKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: itemsKeys.detail(variables.itemId),
      })
    },
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

