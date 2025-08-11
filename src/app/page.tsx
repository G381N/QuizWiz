'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Rocket } from 'lucide-react';
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
      return false; 
    }
    return true; 
  };

  return (
    <div className="space-y-12">
      <section className="text-left">
          <p className="text-muted-foreground text-lg">Hello, Orenji</p>
          <h1 className="text-4xl font-bold">Here are the best Quizzes for you today!</h1>
      </section>

      <section className="bg-white p-6 rounded-3xl shadow-lg border border-purple-100 flex items-center gap-6">
        <Image src="/rocket.png" alt="Rocket" width={120} height={120} data-ai-hint="rocket space" />
        <div className="flex-grow">
          <h2 className="text-2xl font-bold">Quiz about space</h2>
          <p className="text-muted-foreground mb-4">A limited extent in one, two, or three dimensions: distance.</p>
          <Button size="lg" className="w-full md:w-auto" onClick={() => handleCreateQuiz('Space', 'beginner')}>Play now</Button>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Recent Quizzes</h2>
        </div>
        <QuizFeed quizzes={quizzes} />
      </section>

      <section className="my-12">
         <QuizForm onCreateQuiz={handleCreateQuiz} />
      </section>
    </div>
  );
}
