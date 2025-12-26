import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { getUserPreferences } from '@/lib/actions/preferences';
import ThemeProvider from '@/components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ideal Budget',
  description: 'Smart offline budget coach with AI receipt scanning',
  manifest: '/manifest.json', // Placeholder for PWA
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f172a',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const prefs = await getUserPreferences();

  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ThemeProvider
            initialTheme={prefs.theme}
            initialAnimation={prefs.animationSpeed}
          />
          <main className="app-shell">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
