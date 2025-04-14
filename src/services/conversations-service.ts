import { makeApiCall } from "@/lib/make-api-call"
import type { Conversation, ConversationCreate, ConversationResponse, ConversationsResponse } from "@/types/api"

export interface GetConversationsParams {
  title?: string
}

export const conversationsService = {
  getConversations: async (params?: GetConversationsParams): Promise<ConversationsResponse> => {
    const response = await makeApiCall<ConversationsResponse>({
      method: "GET",
      path: "api/v1/conversation",
      params: params as Record<string, string | number | boolean | undefined>,
    })
    console.info(response)
    return response.data
  },

  getConversation: async (conversationId: string): Promise<Conversation> => {
    const response = await makeApiCall<ConversationResponse>({
      method: "GET",
      path: `api/v1/conversation/${conversationId}`,
    })
    return response.data.conversation
  },

  createConversation: async (data: ConversationCreate): Promise<Conversation> => {
    const response = await makeApiCall<ConversationResponse, ConversationCreate>({
      method: "POST",
      path: "api/v1/conversation",
      body: data,
    })
    return response.data.conversation
  },

  updateConversation: async (conversationId: string, data: ConversationCreate): Promise<Conversation> => {
    const response = await makeApiCall<ConversationResponse, ConversationCreate>({
      method: "PUT",
      path: `api/v1/conversation/${conversationId}`,
      body: data,
    })
    return response.data.conversation
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await makeApiCall<void>({
      method: "DELETE",
      path: `api/v1/conversation/${conversationId}`,
    })
  },
}

