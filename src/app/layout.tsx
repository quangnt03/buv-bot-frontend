import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import './globals.css';
import { AuthInitializer } from '@/components/auth/auth-initializer';

export const metadata: Metadata = {
  metadataBase: new URL('https://chat.vercel.ai'),
  title: 'Next.js Chatbot Template',
  description: 'Next.js chatbot template using the AI SDK.',
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
      </head>
      <body className="antialiased">

        <Toaster position="top-center" />
        <AuthInitializer>
          {children}
        </AuthInitializer>

      </body>
    </html>
  );
}
