import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { conversationsService, type GetConversationsParams } from "@/services/conversations-service"
import type { ConversationCreate } from "@/types/api"

// Query keys
export const conversationsKeys = {
  all: ["conversations"] as const,
  lists: () => [...conversationsKeys.all, "list"] as const,
  list: (filters: GetConversationsParams) => [...conversationsKeys.lists(), filters] as const,
  details: () => [...conversationsKeys.all, "detail"] as const,
  detail: (id: string) => [...conversationsKeys.details(), id] as const,
}

// Hooks
export function useConversations(params?: GetConversationsParams) {
  return useQuery({
    queryKey: conversationsKeys.list(params || {}),
    queryFn: () => conversationsService.getConversations(params),
  })
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: conversationsKeys.detail(conversationId),
    queryFn: () => conversationsService.getConversation(conversationId),
    enabled: !!conversationId,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ConversationCreate) => conversationsService.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() })
    },
  })
}

export function useUpdateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: ConversationCreate }) =>
      conversationsService.updateConversation(conversationId, data),
    onSuccess: (updatedConversation: any) => {
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: conversationsKeys.detail(updatedConversation.id),
      })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => conversationsService.deleteConversation(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: conversationsKeys.detail(conversationId),
      })
    },
  })
}

