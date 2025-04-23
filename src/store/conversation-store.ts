import { create } from "zustand"

export interface Conversation {
  id: string
  title: string
}

interface ConversationState {
  conversations: Conversation[]
  selectedConversationId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  setConversations: (conversations: Conversation[]) => void
  selectConversation: (id: string | null) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  deleteConversation: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  selectedConversationId: null,
  isLoading: false,
  error: null,

  // Actions
  setConversations: (newConversations) => set({ conversations: newConversations }),
  selectConversation: (id) => set({ selectedConversationId: id }),
  addConversation: (conversation) => set((state) => ({ conversations: [...state.conversations, conversation] })),
  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => (conv.id === id ? { ...conv, ...updates } : conv)),
    })),
  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== id),
      selectedConversationId: state.selectedConversationId === id ? null : state.selectedConversationId,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
