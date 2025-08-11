
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
          <p className="text-muted-foreground">Hello, Orenji Tomomi</p>
          <h1 className="text-4xl font-bold">What will you learn today?</h1>
      </section>

      <section className="bg-white p-6 rounded-3xl shadow-lg border border-purple-100 flex items-center gap-6">
        <div className="w-32 h-32 relative flex-shrink-0">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute -left-12 -top-12">
            <path fill="#8A2BE2" d="M37.7,-49.6C48.5,-38.3,56.7,-24.5,62.3,-8.6C67.9,7.4,70.9,25.4,63.9,38.5C56.9,51.6,40,60,24.1,65.7C8.2,71.4,-6.6,74.5,-21.8,70.3C-37,66.1,-52.6,54.6,-61.2,40.1C-69.8,25.6,-71.4,8,-67.2,-6.6C-63,-21.2,-53.1,-32.9,-42,-43.9C-30.9,-54.9,-18.7,-65.2,-4.5,-64.5C9.7,-63.8,19.4,-52.1,37.7,-49.6Z" transform="translate(100 100)" />
          </svg>
           <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute -right-12 -bottom-12">
            <path fill="#FFD700" d="M46.2,-48.9C57.4,-36.5,62.3,-20,62.8,-4.1C63.2,11.8,59.2,27.1,49.8,39.1C40.3,51.1,25.4,59.8,9.4,63.8C-6.6,67.8,-23.7,67.1,-37.9,59.8C-52.1,52.5,-63.4,38.6,-68.2,23.1C-73,7.6,-71.2,-9.4,-63.4,-23.3C-55.6,-37.2,-41.8,-47.9,-27.6,-53.4C-13.4,-58.9,-6.7,-59.2,3.3,-58.8C13.3,-58.5,26.6,-57.6,46.2,-48.9Z" transform="translate(100 100)" />
          </svg>
          <div data-ai-hint="rocket space" className="relative z-10 w-32 h-32">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.5C12 2.5 14.5 6 14.5 9.5C14.5 13 12 16.5 12 16.5" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16.5C12 16.5 9.5 13 9.5 9.5C9.5 6 12 2.5 12 2.5" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.5 9.5C15.5 9.5 16.5 9 16.5 8C16.5 7 15.5 6.5 14.5 6.5" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.5 9.5C8.5 9.5 7.5 9 7.5 8C7.5 7 8.5 6.5 9.5 6.5" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16.5V21.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 21.5H14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.5 18.5L7.5 20.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.5 18.5L16.5 20.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
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
