'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, BookOpen } from 'lucide-react';

import { QuizForm } from '@/components/QuizForm';
import { QuizFeed } from '@/components/QuizFeed';
import { type Quiz } from '@/types';
import { generateQuiz, type GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { useToast } from '@/hooks/use-toast';

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
        // Add some mock data if no quizzes are stored
        const mockQuizzes: Quiz[] = [
          {
            id: '1',
            topic: 'Solar System',
            difficulty: 'beginner',
            questions: [
              { question: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], answer: 'Mars' },
              { question: 'What is the largest planet in our solar system?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], answer: 'Jupiter' }
            ]
          },
          {
            id: '2',
            topic: 'World Oceans',
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
      return false; // Indicate failure
    }
    return true; // Indicate success
  };

  return (
    <div className="space-y-12">
      <section className="text-center bg-card p-8 rounded-xl shadow-lg border border-primary/20">
        <div className="flex justify-center items-center gap-4 mb-4">
          <BrainCircuit className="h-16 w-16 text-primary" />
          <div>
            <h1 className="text-5xl font-bold font-headline text-primary-foreground">Welcome to QuizWiz Kids!</h1>
            <p className="text-muted-foreground text-lg mt-2">Create a fun quiz on any topic and challenge your friends!</p>
          </div>
        </div>
        <div className="mt-8 max-w-2xl mx-auto">
          <QuizForm onCreateQuiz={handleCreateQuiz} />
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold font-headline">Recent Quizzes</h2>
        </div>
        <QuizFeed quizzes={quizzes} />
      </section>
    </div>
  );
}
