import { makeApiCall } from "@/lib/make-api-call"
import type { ChatHistoryResponse, ChatRequest, ChatResponse, Message } from "@/types/api"

export const chatService = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await makeApiCall<ChatResponse, ChatRequest>({
      baseUrl: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL,
      method: "POST",
      path: "api/v1/chat",
      body: data,
    })
    return response.data
  },

  getChatHistory: async (conversationId: string, limit = 20): Promise<ChatHistoryResponse> => {
    const response = await makeApiCall<ChatHistoryResponse>({
      baseUrl: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL,
      method: "GET",
      path: `api/v1/chat/history/${conversationId}`,
      params: { limit },
    })
    return response.data
  },

  getMessage: async (conversationId: string, messageId: string): Promise<Message> => {
    const response = await makeApiCall<Message>({
      baseUrl: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL,
      method: "GET",
      path: `api/v1/chat/history/${conversationId}/${messageId}`,
    })
    return response.data
  },
}

