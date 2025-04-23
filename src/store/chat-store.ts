import { create } from "zustand"

export interface Message {
  id: string
  conversationId: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: string
}

interface ChatState {
  messages: Message[]
  activeConversationId: string | null
  currentMessage: string
  isLoading: boolean
  error: string | null

  // Actions
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setActiveConversationId: (id: string | null) => void
  setCurrentMessage: (message: string) => void
  clearMessages: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  activeConversationId: null,
  currentMessage: "",
  isLoading: false,
  error: null,

  // Actions
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
  setCurrentMessage: (currentMessage) => set({ currentMessage }),
  clearMessages: () => set({ messages: [] }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
