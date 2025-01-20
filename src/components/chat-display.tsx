import React from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { ChatMessage } from "@/types"

interface ChatDisplayProps {
  messages: ChatMessage[]
}

export function ChatDisplay({ messages }: ChatDisplayProps) {
  return (
    <ScrollArea className="flex-1 px-4 py-6">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}>
          <div className={`flex ${message.sender === "user" ? "flex-row-reverse" : "flex-row"} items-center`}>
            <Avatar className="w-8 h-8">
              <AvatarFallback>{message.sender === "user" ? "U" : "A"}</AvatarFallback>
            </Avatar>
            <Card className={`mx-2 p-2 ${message.sender === "user" ? "bg-blue-200" : "bg-white"}`}>
              {message.content}
            </Card>
          </div>
        </div>
      ))}
    </ScrollArea>
  )
}

