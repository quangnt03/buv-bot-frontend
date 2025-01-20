"use client"

import type React from "react"
import { ChatDisplay } from "@/components/chat-display"
import { ChatBox } from "@/components/chat-box"
import { useChatStore } from "@/stores/chat"

export default function ChatPage() {
  const { getCurrentConversation, addMessage } = useChatStore()
  const currentConversation = getCurrentConversation()

  const handleSendMessage = (message: string) => {
    if (!currentConversation) return

    const newUserMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user" as const,
    }

    const newAssistantMessage = {
      id: (Date.now() + 1).toString(),
      content: `This is a mock response to: "${message}"`,
      sender: "assistant" as const,
    }

    addMessage(currentConversation.id, newUserMessage)
    addMessage(currentConversation.id, newAssistantMessage)
  }

  return (
    <>
      {currentConversation && (
        <>
          <ChatDisplay messages={currentConversation.messages} />
          <ChatBox onSendMessage={handleSendMessage} />
        </>
      )}
    </>
  )
}

