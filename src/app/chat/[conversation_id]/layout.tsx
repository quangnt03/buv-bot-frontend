import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AuthGuard } from '@/components/auth/auth-guard'

export const metadata: Metadata = {
  title: 'Chat | CloudChat',
  description: 'Chat with your documents using AI',
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>}>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </Suspense>
    </AuthGuard>
  )
} 