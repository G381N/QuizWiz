'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Home, RotateCw, Star } from 'lucide-react';
import * as React from 'react';
import Image from 'next/image';

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
      <Card className="w-full max-w-md text-center shadow-2xl animate-in fade-in zoom-in-95 rounded-2xl p-6 bg-secondary border border-border">
        <CardHeader className="p-0">
          <div className="relative w-48 h-24 mx-auto">
             <Award className="absolute -top-4 left-1/2 -translate-x-1/2 text-primary w-24 h-24" />
          </div>
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
