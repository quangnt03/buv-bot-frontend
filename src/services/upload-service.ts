import { makeApiCall } from "@/lib/make-api-call"
import type { DriveUrl, UploadResponse } from "@/types/api"

export const uploadService = {
  uploadFile: async (data: DriveUrl): Promise<UploadResponse> => {
    const response = await makeApiCall<UploadResponse, DriveUrl>({
      method: "POST",
      path: "/api/v1/upload",
      body: data,
    })
    return response.data
  },
}

