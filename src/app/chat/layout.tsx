import type { Metadata } from 'next'
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
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AuthGuard>
  )
} 