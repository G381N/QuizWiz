
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { QuizCard } from '@/components/QuizCard';
import { type Quiz } from '@/types';
import { generateQuiz, type GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QuizForm } from '@/components/QuizForm';


export default function Home() {
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
  const [isQuizFormOpen, setIsQuizFormOpen] = React.useState(false);
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
            ],
            leaderboard: [
                { rank: 1, name: 'CygnusX1', score: 9850, avatar: '/avatars/1.svg' },
                { rank: 2, name: 'Vortex', score: 9756, avatar: '/avatars/2.svg' },
                { rank: 3, name: 'Nebula', score: 8650, avatar: '/avatars/3.svg' },
            ]
          },
          {
            id: '2',
            topic: 'Deep Oceans',
            difficulty: 'intermediate',
            questions: [
              { question: 'Which is the largest ocean?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer: 'Pacific' }
            ],
            leaderboard: []
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
          leaderboard: [],
        };
        const updatedQuizzes = [newQuiz, ...quizzes];
        setQuizzes(updatedQuizzes);
        localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
        setIsQuizFormOpen(false);
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
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Your Quizzes</h1>
         <Dialog open={isQuizFormOpen} onOpenChange={setIsQuizFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border">
              <DialogHeader>
                <DialogTitle>Create a New Quiz</DialogTitle>
                <DialogDescription>
                  What would you like to learn about today?
                </DialogDescription>
              </DialogHeader>
              <QuizForm onCreateQuiz={handleCreateQuiz} />
            </DialogContent>
          </Dialog>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-secondary/30 rounded-2xl border-2 border-dashed border-border">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium">No quizzes yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating a new quiz.
          </p>
          <div className="mt-6">
             <Dialog open={isQuizFormOpen} onOpenChange={setIsQuizFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background border-border">
                  <DialogHeader>
                    <DialogTitle>Create a New Quiz</DialogTitle>
                    <DialogDescription>
                      What would you like to learn about today?
                    </DialogDescription>
                  </DialogHeader>
                  <QuizForm onCreateQuiz={handleCreateQuiz} />
                </DialogContent>
              </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}

    