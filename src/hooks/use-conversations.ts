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
    mutationFn: async ({ conversationId, data }: { conversationId: string; data: ConversationCreate }) => {
      try {
        const updatedConversation = await conversationsService.updateConversation(conversationId, data)
        // Ensure we have a valid ID
        if (!updatedConversation || !updatedConversation.id) {
          // If no valid response, use the input ID to make the rest of the code work
          return { ...updatedConversation, id: conversationId }
        }
        return updatedConversation
      } catch (error) {
        // Ensure we have a valid error message
        console.error("Error updating conversation:", error)
        throw error
      }
    },
    onSuccess: (updatedConversation: any) => {
      if (updatedConversation) {
        // Make sure we have a valid ID
        const conversationId = updatedConversation.id
        if (conversationId) {
          queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() })
          queryClient.invalidateQueries({
            queryKey: conversationsKeys.detail(conversationId),
          })
        }
      }
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

// New hook for searching conversations by title
export function useSearchConversations() {
   return useMutation({
    mutationFn: async (searchTerm: string) => {
      // Only search if there's actually a search term
      if (!searchTerm.trim()) {
        return conversationsService.getConversations()
      }
      
      // Search conversations by title
      return conversationsService.getConversations({ title: searchTerm.trim() })
    },
    onSuccess: () => {
      // No need to invalidate any queries since we're just performing a search
    }
  })
}

