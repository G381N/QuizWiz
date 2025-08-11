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

interface QuizCardProps {
  quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300 rounded-3xl bg-white/80 backdrop-blur-sm border-purple-100">
      <CardHeader>
        <CardTitle className="font-bold text-xl">{quiz.topic}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">
          A {quiz.questions.length}-question quiz to test your knowledge.
        </p>
         <div className="flex items-center pt-2">
          <Badge variant="secondary" className="capitalize flex items-center bg-purple-100 text-purple-800">
            {quiz.difficulty}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="ghost">
          <Link href={`/quiz/${quiz.id}`}>
            Play now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
