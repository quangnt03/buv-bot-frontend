import { create } from "zustand"
import type { ChatMessage, Conversation } from "@/types"

interface ChatStore {
  conversations: Conversation[]
  currentConversationId: string
  setCurrentConversationId: (id: string) => void
  addConversation: (conversation: Conversation) => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  getCurrentConversation: () => Conversation | undefined
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [
    { id: "1", title: "Chat History 1", messages: [] },
    { id: "2", title: "Chat History 2", messages: [] },
  ],
  currentConversationId: "1",
  setCurrentConversationId: (id: string) => set({ currentConversationId: id }),
  addConversation: (conversation: Conversation) =>
    set((state) => ({ conversations: [...state.conversations, conversation] })),
  addMessage: (conversationId: string, message: ChatMessage) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, messages: [...conv.messages, message] } : conv,
      ),
    })),
  getCurrentConversation: () => {
    const { conversations, currentConversationId } = get()
    return conversations.find((conv) => conv.id === currentConversationId)
  },
}))
