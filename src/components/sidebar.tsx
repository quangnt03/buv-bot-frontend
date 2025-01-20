import React from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Menu, User } from 'lucide-react'
import { Conversation } from '@/types'
import { useChatStore } from '@/stores/chat'

interface SidebarProps {
  conversations: Conversation[]
  onSelectConversation: (conversation: Conversation) => void
  currentConversationId: string
}

export function Sidebar() {
  const { conversations, currentConversationId, setCurrentConversationId } = useChatStore()
  const onSelectConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id)
  }
  return (
    <div className="w-64 bg-gray-200 flex flex-col h-full">
      <div className="flex justify-between items-center p-4">
        <Button variant="ghost" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 px-4">
        {conversations.map((conversation) => (
          <Button
            key={conversation.id}
            className="w-full mb-2 justify-start"
            variant={conversation.id === currentConversationId ? "secondary" : "ghost"}
            onClick={() => onSelectConversation(conversation)}
          >
            {conversation.title}
          </Button>
        ))}
      </ScrollArea>
      <Button className="m-4" variant="outline">
        <User className="mr-2 h-4 w-4" /> Profile
      </Button>
    </div>
  )
}

