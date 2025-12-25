import type { Metadata, Viewport } from 'next';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="app-shell">
          {children}
        </main>
      </body>
    </html>
  );
}
