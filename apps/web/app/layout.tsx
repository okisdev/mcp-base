import type { Metadata } from 'next';
import '@/styles/globals.css';
import font from '@/styles/font';

export const metadata: Metadata = {
  title: 'MCP Base',
  description: 'MCP Base',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${font.geistSans.className} ${font.geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
