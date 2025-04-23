import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { SidebarToggle } from "@/components/ui/sidebar-toggle"

import './globals.css';
import { AuthInitializer } from '@/components/auth/auth-initializer';
import { QueryProvider } from '@/providers/query-provider';
import { SidebarProvider } from '@/components/ui/sidebar'

export const metadata: Metadata = {
  title: 'CloudChat',
  description: 'Document intelligence platform',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" richColors />

        <AuthInitializer>
          <QueryProvider>
            <SidebarProvider>
              <SidebarToggle />
              {children}
            </SidebarProvider>
          </QueryProvider>
        </AuthInitializer>
      </body>
    </html>
  );
}
