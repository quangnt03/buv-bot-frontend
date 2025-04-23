import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { chatService } from "@/services/chat-service"
import type { ChatRequest, Message } from "@/types/api"

// Query keys
export const chatKeys = {
  all: ["chat"] as const,
  histories: () => [...chatKeys.all, "history"] as const,
  history: (conversationId: string) => [...chatKeys.histories(), conversationId] as const,
  conversationHistory: (conversationId: string, limit?: number) =>
    [...chatKeys.history(conversationId), { limit }] as const,
  message: (conversationId: string, messageId: string) =>
    [...chatKeys.all, "message", conversationId, messageId] as const,
}

// Hook to fetch chat history for a conversation
export function useChatHistory(conversationId: string) {
  return useQuery({
    queryKey: chatKeys.history(conversationId),
    queryFn: () => chatService.getChatHistory(conversationId),
    enabled: !!conversationId,
  })
}

// Hook to send a message to a conversation
export function useChat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ChatRequest) => chatService.sendMessage(data),
    onSuccess: (_, variables) => {
      // Invalidate chat history queries to trigger a refetch
      queryClient.invalidateQueries({ 
        queryKey: chatKeys.history(variables.conversation_id) 
      })
    },
  })
}

export function useMessage(conversationId: string, messageId: string) {
  return useQuery({
    queryKey: chatKeys.message(conversationId, messageId),
    queryFn: () => chatService.getMessage(conversationId, messageId),
    enabled: !!conversationId && !!messageId,
  })
}

