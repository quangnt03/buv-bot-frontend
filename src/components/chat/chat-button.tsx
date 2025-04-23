"use client"

import { useRouter } from 'next/navigation'
import { Button, ButtonProps } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { useConversationStore } from '@/store/conversation-store'
import { useChatStore } from '@/store/chat-store'
import { toast } from 'sonner'
import { MouseEvent } from 'react'

interface ChatButtonProps extends ButtonProps {
  conversationId?: string
  showIcon?: boolean
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}

export function ChatButton({ 
  conversationId, 
  showIcon = true, 
  children = 'Chat', 
  onClick,
  ...props 
}: ChatButtonProps) {
  const router = useRouter()
  const { selectConversation } = useConversationStore()
  const { setActiveConversationId } = useChatStore()
  
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!conversationId) {
      toast.error('No folder selected')
      return
    }
    
    // Select the conversation in the store
    selectConversation(conversationId)
    
    // Set active conversation in chat store
    setActiveConversationId(conversationId)
    
    // Call the custom onClick handler if provided
    if (onClick) {
      onClick(e)
      return
    }
    
    // Navigate to the chat page
    router.push(`/chat/${conversationId}`)
  }
  
  return (
    <Button 
      variant="secondary" 
      onClick={handleClick}
      disabled={!conversationId}
      {...props}
    >
      {showIcon && <MessageSquare className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  )
} 