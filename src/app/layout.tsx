import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-body antialiased min-h-screen flex flex-col`}>
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
