import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatBoxProps {
  onSendMessage: (message: string) => void
}

export function ChatBox({ onSendMessage }: ChatBoxProps) {
  const [inputMessage, setInputMessage] = useState("")

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return
    onSendMessage(inputMessage)
    setInputMessage("")
  }

  return (
    <div className="flex items-center p-4 bg-white border-t">
      <Input
        className="flex-1 mr-2"
        placeholder="Type your message..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
      />
      <Button onClick={handleSendMessage}>Send</Button>
    </div>
  )
}

