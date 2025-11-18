import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'MedIndex',
  description: 'Search, compare, and get AI-guided insights on every U.S. MD/DO school.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <main className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-10">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <div className="text-xl font-semibold text-brand-600">MedIndex</div>
                <nav className="flex gap-6 text-sm text-slate-600">
                  <a href="/schools">Schools</a>
                  <a href="/compare">Compare</a>
                  <a href="/match">Match Me</a>
                  <a href="/advisor">AI Advisor</a>
                  <a href="/personal-statement">Personal Statement</a>
                </nav>
              </div>
            </header>
            <div className="px-4 py-10 sm:px-6 lg:px-8">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
