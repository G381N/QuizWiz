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

const difficultyIcons: { [key: string]: React.ReactNode } = {
  'dumb-dumb': <ToyBrick className="h-4 w-4 mr-1" />,
  'novice': <Star className="h-4 w-4 mr-1" />,
  'beginner': <BarChart3 className="h-4 w-4 mr-1" />,
  'intermediate': <Medal className="h-4 w-4 mr-1" />,
  'advanced': <Rocket className="h-4 w-4 mr-1" />,
  'expert': <Brain className="h-4 w-4 mr-1" />,
};

export function QuizCard({ quiz }: QuizCardProps) {
  const icon = difficultyIcons[quiz.difficulty] || <BarChart3 className="h-4 w-4 mr-1" />;
  
  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{quiz.topic}</CardTitle>
        <div className="flex items-center pt-2">
          <Badge variant="secondary" className="capitalize flex items-center">
            {icon}
            {quiz.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">
          A {quiz.questions.length}-question quiz to test your knowledge.
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link href={`/quiz/${quiz.id}`}>
            Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
