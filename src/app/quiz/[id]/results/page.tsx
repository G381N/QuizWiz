'use client';

import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, RotateCw } from 'lucide-react';
import * as React from 'react';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const [finalScore, setFinalScore] = React.useState(0);

  React.useEffect(() => {
    const score = localStorage.getItem(`quiz_score_${quizId}`);
    if (score) {
      setFinalScore(parseInt(score, 10));
    }
  }, [quizId]);

  const bonus = Math.floor(finalScore * 0.1);
  const totalScore = finalScore + bonus;

  const handlePlayAgain = () => {
    localStorage.removeItem(`quiz_score_${quizId}`);
    router.push(`/quiz/${quizId}`);
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md text-center shadow-2xl animate-in fade-in zoom-in-95 rounded-2xl p-6 bg-secondary/50 border border-border">
        <CardHeader className="p-0">
           <svg
              className="w-24 h-24 mx-auto text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 z" />
              <path d="M12 2" />
            </svg>
          <CardTitle className="text-2xl font-bold mt-4">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 my-8">
            <p className="text-5xl font-extrabold text-primary tracking-tighter">{totalScore.toLocaleString()}</p>
            <p className="text-muted-foreground -mt-2">Total Score</p>
            <div className="bg-background/50 rounded-xl p-4 space-y-3 text-left">
                <div className="flex justify-between items-center text-lg">
                    <span className="text-muted-foreground">Base Score</span>
                    <span className="font-bold">{finalScore.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                    <span className="text-muted-foreground">Time Bonus</span>
                    <span className="font-bold text-green-400">+{bonus.toLocaleString()}</span>
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button size="lg" className="w-full" onClick={handlePlayAgain}>
            <RotateCw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => router.push('/')}>
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
