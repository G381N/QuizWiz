'use client';

import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Home } from 'lucide-react';
import * as React from 'react';
import { type Quiz } from '@/types';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const score = searchParams.get('score');
  const quizId = params.id as string;

  const [quiz, setQuiz] = React.useState<Quiz | null>(null);

  React.useEffect(() => {
    try {
        const storedQuizzes = localStorage.getItem('quizzes');
        if (storedQuizzes) {
            const quizzes: Quiz[] = JSON.parse(storedQuizzes);
            setQuiz(quizzes.find(q => q.id === quizId) || null);
        }
    } catch (error) {
        console.error("Failed to load quiz for results", error);
    }
  }, [quizId]);

  const finalScore = score ? parseInt(score, 10) : 0;

  const getResultMessage = () => {
    if (finalScore > 1000) return "Fantastic! You're a true Quiz Wiz!";
    if (finalScore > 500) return 'Great job! You really know your stuff!';
    if (finalScore > 0) return 'Good try! Keep practicing!';
    return "That was tricky! Better luck next time!";
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-lg text-center shadow-2xl animate-in fade-in zoom-in-95">
        <CardHeader>
          <div className="mx-auto bg-primary p-4 rounded-full w-fit">
            <Trophy className="h-12 w-12 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-headline mt-4">Quiz Complete!</CardTitle>
          {quiz && <p className="text-muted-foreground text-lg">Results for: {quiz.topic}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xl">{getResultMessage()}</p>
          <p className="text-6xl font-bold text-primary">{finalScore}</p>
          <p className="text-muted-foreground">points</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href={`/quiz/${quizId}`}>
              Play Again
            </Link>
          </Button>
          <Button asChild className="bg-accent hover:bg-accent/90">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
