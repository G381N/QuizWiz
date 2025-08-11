
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { QuizForm } from '@/components/QuizForm';
import { QuizFeed } from '@/components/QuizFeed';
import { type Quiz } from '@/types';
import { generateQuiz, type GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    try {
      const storedQuizzes = localStorage.getItem('quizzes');
      if (storedQuizzes) {
        setQuizzes(JSON.parse(storedQuizzes));
      } else {
        const mockQuizzes: Quiz[] = [
          {
            id: '1',
            topic: 'The Cosmos',
            difficulty: 'beginner',
            questions: [
              { question: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], answer: 'Mars' },
              { question: 'What is the largest planet in our solar system?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], answer: 'Jupiter' }
            ]
          },
          {
            id: '2',
            topic: 'Deep Oceans',
            difficulty: 'intermediate',
            questions: [
              { question: 'Which is the largest ocean?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer: 'Pacific' }
            ]
          }
        ];
        setQuizzes(mockQuizzes);
        localStorage.setItem('quizzes', JSON.stringify(mockQuizzes));
      }
    } catch (error) {
      console.error("Failed to parse quizzes from localStorage", error);
    }
  }, []);

  const handleCreateQuiz = async (topic: string, difficulty: string) => {
    try {
      const result: GenerateQuizOutput = await generateQuiz({ topic, difficulty });
      if (result && result.quiz) {
        const newQuiz: Quiz = {
          id: new Date().getTime().toString(),
          topic,
          difficulty,
          questions: result.quiz,
        };
        const updatedQuizzes = [newQuiz, ...quizzes];
        setQuizzes(updatedQuizzes);
        localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
        router.push(`/quiz/${newQuiz.id}`);
      } else {
        throw new Error('Failed to generate quiz, please try again.');
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      return false; 
    }
    return true; 
  };

  return (
    <div className="space-y-12">
      <section className="text-center animate-in fade-in-50 duration-500">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">Expand Your Knowledge</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Welcome back! Choose a quiz to play or create your own with the power of AI.</p>
      </section>

      <section className="grid md:grid-cols-5 gap-8 items-center animate-in fade-in-50 delay-150 duration-500">
        <div className="md:col-span-3">
          <QuizForm onCreateQuiz={handleCreateQuiz} />
        </div>
        <div className="md:col-span-2 bg-secondary rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32 mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
                <div data-ai-hint="rocket space" className="relative z-10">
                    <svg width="128" height="128" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.11321 13.333L13.8811 15.2229C17.2872 16.53 18.9902 17.184 19.9881 16.685C21 16.186 21 14.7187 21 11.7844V11.5143C21 8.52182 21 7.02558 19.9881 6.52661C18.9902 6.02765 17.2872 6.68171 13.8811 7.98982L9.11321 9.8797C6.94162 10.7412 5.85582 11.1719 5.43639 11.8364C5 12.5009 5 13.321 5.43639 13.9855C5.85582 14.6499 6.94162 15.0807 9.11321 15.9422L9.11321 13.333Z" fill="url(#paint0_linear_1_2)"/>
                      <path d="M9 16L5 20" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M9 7L5 3" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
                      <defs>
                      <linearGradient id="paint0_linear_1_2" x1="5" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stopColor="hsl(var(--primary))" stopOpacity="0.5"/>
                      <stop offset="1" stopColor="hsl(var(--primary))"/>
                      </linearGradient>
                      </defs>
                    </svg>
                </div>
            </div>
            <h3 className="text-xl font-bold">Featured Quiz</h3>
            <p className="text-muted-foreground mt-1 mb-4 text-sm">Test your knowledge about the vast universe.</p>
            <Button size="lg" className="w-full" onClick={() => handleCreateQuiz('The Cosmos', 'beginner')}>
              Play: The Cosmos
            </Button>
        </div>
      </section>

      <section className="animate-in fade-in-50 delay-300 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-7 w-7 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Recent Quizzes</h2>
        </div>
        <QuizFeed quizzes={quizzes} />
      </section>
    </div>
  );
}
