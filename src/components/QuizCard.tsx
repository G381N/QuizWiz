
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
import { type Quiz, type QuizLeaderboardEntry } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

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

const TrophyIcon = ({color, className}: {color: string, className?: string}) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color}
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={cn("w-4 h-4", className)}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
)

const medalColors: { [key: number]: string } = {
    1: '#FFD700', // Gold
    2: '#C0C0C0', // Silver
    3: '#CD7F32'  // Bronze
};


export function QuizCard({ quiz }: QuizCardProps) {
  const uniqueTopPlayers = quiz.leaderboard?.reduce((acc, player) => {
    if (!acc.some(p => p.name === player.name)) {
        acc.push(player);
    }
    return acc;
  }, [] as QuizLeaderboardEntry[]).slice(0, 3) || [];

  return (
    <Card className="flex flex-col h-full bg-secondary/50 border-border hover:border-primary/50 transition-colors duration-300 rounded-2xl group">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-bold text-lg pr-2">{quiz.topic}</CardTitle>
            <Badge variant="outline" className={cn("capitalize border text-xs w-fit shrink-0", difficultyColors[quiz.difficulty as keyof typeof difficultyColors] || difficultyColors.beginner)}>
                {quiz.difficulty}
            </Badge>
        </div>
        <p className="text-sm text-muted-foreground pt-1">{quiz.description || 'A fun quiz on this interesting topic!'}</p>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Leaderboard</p>
          {uniqueTopPlayers.length > 0 ? (
            <div className="space-y-2">
                {uniqueTopPlayers.map((player) => (
                    <div key={player.rank} className="flex items-center gap-3">
                        <TrophyIcon color={medalColors[player.rank] || '#A9A9A9'} />
                        <span className="text-sm font-medium">{player.name.split(' ')[0]}</span>
                        <span className="text-sm text-primary font-bold ml-auto">{player.score.toLocaleString()} PTS</span>
                    </div>
                ))}
            </div>
          ) : (
             <div className="text-sm text-muted-foreground/70 text-center py-4">
                Be the first to set a score!
             </div>
          )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/quiz/${quiz.id}`}>Start Quiz</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
