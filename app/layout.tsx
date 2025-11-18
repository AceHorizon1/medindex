import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/NavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MedIndex - Medical School Search & Advisor',
  description: 'Search, compare, and get AI-guided insights on every U.S. MD/DO medical school.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}

