import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadService } from "@/services/upload-service"
import type { DriveUrl } from "@/types/api"
import { itemsKeys } from "@/hooks/use-items"

export function useUploadFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DriveUrl) => uploadService.uploadFile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsKeys.lists() })
    },
  })
}

