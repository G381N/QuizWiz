
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
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
import { useAuth } from '@/hooks/use-auth';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardPage() {
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isQuizFormOpen, setIsQuizFormOpen] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(collection(db, 'quizzes'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const userQuizzes: Quiz[] = [];
        querySnapshot.forEach((doc) => {
          userQuizzes.push({ id: doc.id, ...(doc.data() as Omit<Quiz, 'id'>) });
        });
        setQuizzes(userQuizzes);
      } catch (error) {
        console.error("Failed to fetch quizzes from Firestore", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your quizzes.',
        });
      }
      setLoading(false);
    };

    fetchQuizzes();
  }, [user, toast]);

  const handleCreateQuiz = async (topic: string, difficulty: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a quiz.' });
      return false;
    }
    try {
      const result: GenerateQuizOutput = await generateQuiz({ topic, difficulty });
      if (result && result.quiz) {
        const newQuizData = {
          userId: user.uid,
          topic,
          difficulty,
          questions: result.quiz,
          leaderboard: [],
        };
        const docRef = await addDoc(collection(db, 'quizzes'), newQuizData);
        const newQuiz = { id: docRef.id, ...newQuizData };

        setQuizzes([newQuiz, ...quizzes]);
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

  if (loading) {
      return (
          <div className="flex justify-center items-center h-[60vh]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }

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
