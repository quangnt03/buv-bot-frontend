"use client"

import { Plus, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActionButtonsProps {
  onAddClick: () => void;
  onChatClick: () => void;
  isChatDisabled?: boolean;
}

export function ActionButtons({ 
  onAddClick, 
  onChatClick, 
  isChatDisabled = false 
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Add
      </Button>
      <Button variant="secondary" onClick={onChatClick} disabled={isChatDisabled}>
        <MessageSquare className="mr-2 h-4 w-4" />
        Chat
      </Button>
    </div>
  );
} 