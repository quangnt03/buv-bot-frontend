import { makeApiCall } from "@/lib/make-api-call"
import type { ChatHistoryResponse, ChatRequest, ChatResponse, Message } from "@/types/api"

export const chatService = {
  sendMessage: async (data: ChatRequest): Promise<Message> => {
    const response = await makeApiCall<ChatResponse, ChatRequest>({
      method: "POST",
      path: "api/v1/chat",
      body: data,
    })
    return response.data.message
  },

  getChatHistory: async (conversationId: string, limit = 5): Promise<ChatHistoryResponse> => {
    const response = await makeApiCall<ChatHistoryResponse>({
      method: "GET",
      path: `api/v1/chat/history/${conversationId}`,
      params: { limit },
    })
    return response.data
  },

  getMessage: async (conversationId: string, messageId: string): Promise<Message> => {
    const response = await makeApiCall<ChatResponse>({
      method: "GET",
      path: `api/v1/chat/history/${conversationId}/${messageId}`,
    })
    return response.data.message
  },
}

