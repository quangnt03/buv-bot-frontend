"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/store/chat-store"
import { useConversationStore } from "@/store/conversation-store"
import { v4 as uuidv4 } from "uuid"

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const { messages, activeConversationId, currentMessage, setCurrentMessage, addMessage, isLoading, setLoading } =
    useChatStore()

  const { conversations } = useConversationStore()

  const activeConversation = conversations.find((c) => c.id === activeConversationId)

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !activeConversationId) return

    // Add user message
    const userMessage = {
      id: uuidv4(),
      conversationId: activeConversationId,
      content: currentMessage.trim(),
      role: "user" as const,
      timestamp: new Date().toISOString(),
    }

    addMessage(userMessage)
    setCurrentMessage("")

    // Simulate AI response
    setLoading(true)

    // In a real app, you would call your API here
    setTimeout(() => {
      const aiMessage = {
        id: uuidv4(),
        conversationId: activeConversationId,
        content: `This is a response to: "${currentMessage.trim()}"`,
        role: "assistant" as const,
        timestamp: new Date().toISOString(),
      }

      addMessage(aiMessage)
      setLoading(false)
    }, 1000)
  }

  const conversationMessages = messages.filter((msg) => msg.conversationId === activeConversationId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{activeConversation ? activeConversation.title : "Chat"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 mb-4 border rounded-md">
          <div className="space-y-4">
            {conversationMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No messages yet. Start the conversation!</div>
            ) : (
              conversationMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{msg.role === "user" ? "U" : "A"}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`p-3 rounded-lg ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div className="p-3 rounded-lg bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !currentMessage.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
