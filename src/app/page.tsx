
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

      </main>
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} QuizWiz. All rights reserved.
        </div>
      </footer>
    </div>
  );
}


const QuizFormDemo = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <label className="text-sm font-medium">Topic</label>
            <Input placeholder="e.g., The Renaissance" className="bg-secondary/50 border-border" />
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select>
                <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Select a difficulty..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Button className="w-full" disabled>
            <Plus className="mr-2 h-4 w-4" />
            Generate Quiz
        </Button>
    </div>
);
