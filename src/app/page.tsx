
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

// Dynamically import components that aren't needed for initial render
const QuizFormDemo = dynamic(() => import('@/components/QuizFormDemo'), {
  loading: () => <div className="animate-pulse h-40 w-full bg-secondary/50 rounded-lg"></div>,
  ssr: false,
});

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  if (loading || user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <svg
                className="w-8 h-8 text-primary"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                <path d="M12 2v2"/>
                <path d="M12 20v2"/>
                <path d="M4.93 4.93l1.41 1.41"/>
                <path d="M17.66 17.66l1.41 1.41"/>
                <path d="M2 12h2"/>
                <path d="M20 12h2"/>
                <path d="M6.34 17.66l-1.41 1.41"/>
                <path d="M19.07 4.93l-1.41 1.41"/>
              </svg>
              <span className="text-xl font-bold tracking-tight">QuizWiz</span>
            </Link>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-16 md:py-24 text-center animate-in fade-in-50 duration-500">
          <div className="max-w-3xl mx-auto">
             <Badge variant="outline" className="text-sm font-semibold border-primary/50 text-primary bg-primary/10">
                Fun & Engaging Quizzes
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mt-4">
              Learn Anything, <br/> The Fun Way.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Create and play quizzes on any topic imaginable. Challenge your friends, climb the leaderboards, and become a knowledge master with the power of AI.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/login">
                  Start Learning Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
            <div className="relative rounded-2xl border border-border bg-secondary/30 p-8 md:p-12 overflow-hidden">
                 <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
                 <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-3xl font-bold">Powered by Generative AI</h2>
                        <p className="text-muted-foreground mt-4">
                            Our state-of-the-art AI generates unique and challenging questions tailored to your chosen topic and difficulty. Never run out of new things to learn!
                        </p>
                    </div>
                    <div className="p-8 bg-background/50 rounded-2xl border border-border">
                        <QuizFormDemo />
                    </div>
                </div>
            </div>
        </section>

        <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Why QuizWiz?</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-secondary/30 p-6 rounded-2xl border border-border">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <svg
                            className="w-6 h-6 text-primary"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Competitive Learning</h3>
                    <p className="text-muted-foreground">
                        Climb the global leaderboards and compete with friends. Our point system rewards both speed and accuracy, with higher difficulties offering greater rewards.
                    </p>
                </div>
                <div className="bg-secondary/30 p-6 rounded-2xl border border-border">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <svg
                            className="w-6 h-6 text-primary"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Strategic Power-ups</h3>
                    <p className="text-muted-foreground">
                        Use your hard-earned points to purchase power-ups like 50/50, Score Boosters, and Skip Question. Deploy Time Attacks against opponents to gain a competitive edge!
                    </p>
                </div>
                <div className="bg-secondary/30 p-6 rounded-2xl border border-border">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <svg
                            className="w-6 h-6 text-primary"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                            <line x1="9" y1="9" x2="9.01" y2="9" />
                            <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Adaptive Difficulty</h3>
                    <p className="text-muted-foreground">
                        From 'dumb-dumb' mode for casual fun to 'point-farming' for the ultimate challenge. Each difficulty level offers a balanced experience with appropriate rewards.
                    </p>
                </div>
            </div>
        </section>
        
        <section className="container mx-auto px-4 py-16 bg-secondary/20 rounded-3xl border border-border mb-16">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">How It Works</h2>
                <div className="space-y-8">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                            <span className="font-bold text-primary">1</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Create or Play</h3>
                        <p className="text-muted-foreground">
                            Generate AI-powered quizzes on any topic or play quizzes created by the community. Select your preferred difficulty level to match your knowledge.
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                            <span className="font-bold text-primary">2</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Earn Points</h3>
                        <p className="text-muted-foreground">
                            Answer quickly and correctly to maximize your score. Build answer streaks for bonus points and tackle higher difficulties for greater rewards.
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                            <span className="font-bold text-primary">3</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Compete & Strategize</h3>
                        <p className="text-muted-foreground">
                            Rise through global and quiz-specific leaderboards. Spend points on strategic power-ups in the store to gain advantages and challenge friends with Time Attacks.
                        </p>
                    </div>
                </div>
            </div>
        </section>

      </main>
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} QuizWiz. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
