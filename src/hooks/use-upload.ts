import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadService } from "@/services/upload-service"
import type { DriveUrl } from "@/types/api"
import { itemsKeys } from "@/hooks/use-items"

export function useUploadFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DriveUrl) => uploadService.uploadFile(data),
    onSuccess: (_, variables) => {
      // Invalidate all items lists
      queryClient.invalidateQueries({ queryKey: itemsKeys.lists() })
      
      // Specifically invalidate the conversation query for this conversation
      if (variables.conversation_id) {
        queryClient.invalidateQueries({ 
          queryKey: itemsKeys.conversation(variables.conversation_id)
        })
      }
      
      // Add a small delay to ensure React has time to update
      setTimeout(() => {
        queryClient.refetchQueries({ 
          queryKey: itemsKeys.conversation(variables.conversation_id) 
        })
      }, 500)
    },
  })
}

