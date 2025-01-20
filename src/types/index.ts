export interface ChatMessage {
    id: string
    content: string
    sender: 'user' | 'assistant'
  }
  
export interface Conversation {
    id: string
    title: string
    messages: ChatMessage[]
}
  
export interface SidebarProps {
    conversations: Conversation[]
    onSelectConversation: (conversation: Conversation) => void
    currentConversationId: string
}