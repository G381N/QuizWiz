
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Crown, Trophy } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { type OverallLeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = React.useState<OverallLeaderboardEntry[]>([]);

  React.useEffect(() => {
    // In a real app, this data would be fetched from a server.
    // For this prototype, we'll generate it from localStorage.
    const overallLeaderboard = localStorage.getItem('overall_leaderboard');
    if (overallLeaderboard) {
      setLeaderboard(JSON.parse(overallLeaderboard));
    } else {
        const mockLeaderboard: OverallLeaderboardEntry[] = [
          { rank: 1, name: 'CygnusX1', quizzesSolved: 25, avatar: '/avatars/1.svg' },
          { rank: 2, name: 'Vortex', quizzesSolved: 22, avatar: '/avatars/2.svg' },
          { rank: 3, name: 'Nebula', quizzesSolved: 18, avatar: '/avatars/3.svg' },
          { rank: 4, name: 'Pulsar', quizzesSolved: 15, avatar: '/avatars/4.svg' },
          { rank: 5, name: 'Quasar', quizzesSolved: 12, avatar: '/avatars/5.svg' },
          { rank: 6, name: 'Orbit', quizzesSolved: 9, avatar: '/avatars/6.svg' },
        ];
        setLeaderboard(mockLeaderboard);
        localStorage.setItem('overall_leaderboard', JSON.stringify(mockLeaderboard));
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Trophy className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Overall Leaderboard</h1>
      </div>
      
      <div className="bg-secondary/50 rounded-2xl border border-border">
        <Table>
          <TableHeader>
             <TableRow className="border-b-border/50">
                <TableHead className="w-24 text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Quizzes Solved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((player) => (
              <TableRow key={player.rank} className="font-medium border-b-0 hover:bg-white/5">
                <TableCell className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center text-lg font-bold">
                        {player.rank === 1 ? <Crown className="w-6 h-6 text-yellow-400" /> : player.rank}
                    </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Image src={player.avatar} alt={player.name} width={40} height={40} className="rounded-full"/>
                    <p className="text-base font-semibold">{player.name}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right text-base text-primary font-bold">
                  {player.quizzesSolved}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

    