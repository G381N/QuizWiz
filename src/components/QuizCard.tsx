'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Quiz } from '@/types';
import { ArrowRight, BarChart3, Brain, Medal, Rocket, Star, ToyBrick } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface QuizCardProps {
  quiz: Quiz;
}

const difficultyColors = {
  'dumb-dumb': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  novice: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  expert: 'bg-red-500/10 text-red-400 border-red-500/20',
} as const;


export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Card className="flex flex-col h-full bg-secondary border-border hover:border-primary/50 transition-colors duration-300 rounded-2xl group">
      <CardHeader>
        <CardTitle className="font-bold text-xl group-hover:text-primary transition-colors">{quiz.topic}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">
          A {quiz.questions.length}-question quiz to test your knowledge.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="outline" className={cn("capitalize border", difficultyColors[quiz.difficulty as keyof typeof difficultyColors] || difficultyColors.beginner)}>
          {quiz.difficulty}
        </Badge>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/quiz/${quiz.id}`}>
            Play Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
