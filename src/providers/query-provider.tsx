"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// Remove the import for ReactQueryDevtools since we're not using it
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, type ReactNode } from "react"

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Removed ReactQueryDevtools to hide it from the UI */}
    </QueryClientProvider>
  )
}

