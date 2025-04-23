import { makeApiCall } from "@/lib/make-api-call"
import type { Conversation, ConversationCreate, ConversationResponse, ConversationsResponse } from "@/types/api"

export interface GetConversationsParams {
  title?: string
}

export const conversationsService = {
  getConversations: async (params?: GetConversationsParams): Promise<ConversationsResponse> => {
    const response = await makeApiCall<ConversationsResponse>({
      baseUrl: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || "http://localhost:3002",
      method: "GET",
      path: "api/v1/conversation",
      params: params as Record<string, string | number | boolean | undefined>,
    })
    return response.data
  },

  getConversation: async (conversationId: string): Promise<Conversation> => {
    const response = await makeApiCall<ConversationResponse>({
      baseUrl: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || "http://localhost:3002",
      method: "GET",
      path: `api/v1/conversation/${conversationId}`,
    })
     return response.data.conversation
  },

  createConversation: async (data: ConversationCreate): Promise<Conversation> => {
    const response = await makeApiCall<ConversationResponse, ConversationCreate>({
      baseUrl: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || "http://localhost:3002",
      method: "POST",
      path: "api/v1/conversation",
      body: data,
    })
    return response.data.conversation
  },

  updateConversation: async (conversationId: string, data: ConversationCreate): Promise<Conversation> => {
    const response = await makeApiCall<Conversation>({
      baseUrl: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || "http://localhost:3002",
      method: "PUT",
      path: `api/v1/conversation/${conversationId}`,
      body: data,
    })
    // Ensure we have a valid response with conversation data
    if (!response.data) {
      throw new Error("Invalid server response: Missing conversation data")
    }
    
    return response.data
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await makeApiCall<void>({
      baseUrl: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || "http://localhost:3002",
      method: "DELETE",
      path: `api/v1/conversation/${conversationId}`,
    })
  },
}

