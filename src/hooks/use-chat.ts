import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { chatService } from "@/services/chat-service"
import type { ChatRequest } from "@/types/api"

// Query keys
export const chatKeys = {
  all: ["chat"] as const,
  history: () => [...chatKeys.all, "history"] as const,
  conversationHistory: (conversationId: string, limit?: number) =>
    [...chatKeys.history(), conversationId, { limit }] as const,
  message: (conversationId: string, messageId: string) =>
    [...chatKeys.all, "message", conversationId, messageId] as const,
}

// Hooks
export function useChatHistory(conversationId: string, limit?: number) {
  return useQuery({
    queryKey: chatKeys.conversationHistory(conversationId, limit),
    queryFn: () => chatService.getChatHistory(conversationId, limit),
    enabled: !!conversationId,
  })
}

export function useMessage(conversationId: string, messageId: string) {
  return useQuery({
    queryKey: chatKeys.message(conversationId, messageId),
    queryFn: () => chatService.getMessage(conversationId, messageId),
    enabled: !!conversationId && !!messageId,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ChatRequest) => chatService.sendMessage(data),
    onSuccess: (message) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversationHistory(message.conversation_id),
      })
    },
  })
}

