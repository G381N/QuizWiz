
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/use-auth';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap', // Ensure text is visible during font load
});


export const metadata: Metadata = {
  title: 'QuizWiz - Fun AI-Powered Quiz Platform',
  description: 'Generate fun, educational quizzes with AI. Challenge friends, improve your knowledge, and climb the leaderboards with QuizWiz!',
  metadataBase: new URL('https://quizwiz.example.com'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'QuizWiz - Learn Through Fun Quizzes',
    description: 'AI-powered quiz platform for learning any topic. Create custom quizzes, compete with friends, and track your progress!',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuizWiz - AI-Powered Learning',
    description: 'Create and play AI-generated quizzes on any topic. Learn, compete, and have fun!',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
      </head>
      <body className={`${inter.variable} font-body antialiased bg-background`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
