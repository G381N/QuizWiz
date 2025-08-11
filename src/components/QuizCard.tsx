
'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Quiz } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowRight, Trophy } from 'lucide-react';

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
  const topPlayer = quiz.leaderboard?.[0];

  return (
    <Link href={`/quiz/${quiz.id}`} className="group">
      <Card className="flex flex-col h-full bg-secondary/50 border-border hover:border-primary/50 transition-colors duration-300 rounded-2xl">
        <CardHeader>
          <CardTitle className="font-bold text-lg">{quiz.topic}</CardTitle>
           <Badge variant="outline" className={cn("capitalize border text-xs w-fit", difficultyColors[quiz.difficulty as keyof typeof difficultyColors] || difficultyColors.beginner)}>
            {quiz.difficulty}
          </Badge>
        </CardHeader>
        <CardContent className="flex-grow space-y-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>
                    {topPlayer ? `${topPlayer.name} - ${topPlayer.score} PTS` : 'No scores yet'}
                </span>
            </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-primary flex items-center font-semibold">
            Start Quiz <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}

    