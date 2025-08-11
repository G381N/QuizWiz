import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});


export const metadata: Metadata = {
  title: 'QuizWiz Kids',
  description: 'Generate fun quizzes with AI!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-body antialiased min-h-screen flex flex-col bg-background`}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 mb-20 md:mb-0">
          {children}
        </main>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
