import { makeApiCall } from "@/lib/make-api-call"
import type { DriveUrl, UploadResponse } from "@/types/api"


export const uploadService = {
  uploadFile: async (data: DriveUrl): Promise<UploadResponse> => {
    const response = await makeApiCall<UploadResponse, DriveUrl>({
      baseUrl: process.env.NEXT_PUBLIC_INGESTION_SERVICE_URL,
      method: "POST",
      path: "api/v1/upload",
      body: data,
    })
    return response.data
  },
}

