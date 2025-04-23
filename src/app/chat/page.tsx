"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useConversationStore } from '@/store/conversation-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ChatRootPage() {
  const router = useRouter()
  const { conversations, selectedConversationId } = useConversationStore()
  
  // useEffect(() => {
  //   // If a conversation is already selected, redirect to its chat page
  //   if (selectedConversationId) {
  //     router.push(`/chat/${selectedConversationId}`)
  //     return
  //   }
    
  //   // If we have conversations but none selected, redirect to the first one
  //   if (conversations.length > 0) {
  //     router.push(`/chat/${conversations[0].id}`)
  //     return
  //   }
    
  //   // No conversations available, redirect to dashboard
  //   router.push('/dashboard')
  // }, [router, conversations, selectedConversationId])
  
  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingSpinner />
      <p className="ml-2">Redirecting...</p>
    </div>
  )
} 