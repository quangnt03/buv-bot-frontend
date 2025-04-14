import { makeApiCall } from "@/lib/make-api-call"
import type { Item, ItemResponse, ItemsResponse, ItemUpdate } from "@/types/api"

export interface GetItemsParams {
  search?: string
  mime_type?: string
  conversation_id?: string
  active_only?: boolean
}

export const itemsService = {
  getItems: async (params?: GetItemsParams): Promise<ItemsResponse> => {
    const response = await makeApiCall<ItemsResponse>({
      method: "GET",
      path: "api/v1/items",
      params: params as Record<string, string | number | boolean | undefined>,
    })
    return response.data
  },

  getItem: async (itemId: string): Promise<Item> => {
    const response = await makeApiCall<ItemResponse>({
      method: "GET",
      path: `api/v1/items/${itemId}`,
    })
    return response.data.item
  },

  updateItem: async (itemId: string, data: ItemUpdate): Promise<Item> => {
    const response = await makeApiCall<ItemResponse, ItemUpdate>({
      method: "PUT",
      path: `api/v1/items/${itemId}`,
      body: data,
    })
    return response.data.item
  },

  deleteItem: async (itemId: string, permanent = false): Promise<void> => {
    await makeApiCall<void>({
      method: "DELETE",
      path: `api/v1/items/${itemId}`,
      params: { permanent },
    })
  },

  deleteConversationItems: async (conversationId: string, permanent = false): Promise<void> => {
    await makeApiCall<void>({
      method: "DELETE",
      path: `api/v1/items/conversation/${conversationId}`,
      params: { permanent },
    })
  },
}

