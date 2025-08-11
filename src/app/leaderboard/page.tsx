import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy } from 'lucide-react';

const mockLeaderboard = [
  { rank: 1, name: 'Smarty Pants', score: 12540 },
  { rank: 2, name: 'Quiz Master', score: 11200 },
  { rank: 3, name: 'Brainiac', score: 9800 },
  { rank: 4, name: 'Prodigy', score: 8500 },
  { rank: 5, name: 'Genius Jr.', score: 7650 },
  { rank: 6, name: 'Clever Clogs', score: 6800 },
  { rank: 7, name: 'The Thinker', score: 5400 },
  { rank: 8, name: 'Egghead', score: 4950 },
  { rank: 9, name: 'Whiz Kid', score: 3200 },
  { rank: 10, name: 'Bookworm', score: 2100 },
];

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Trophy className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold font-headline">Leaderboard</h1>
      </div>
      <div className="bg-card rounded-lg border shadow-lg">
        <Table>
          <TableCaption>Top 10 players in QuizWiz Kids.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLeaderboard.map((player) => (
              <TableRow key={player.rank} className="font-medium">
                <TableCell className="text-center text-lg">
                  {player.rank === 1 && '🥇'}
                  {player.rank === 2 && '🥈'}
                  {player.rank === 3 && '🥉'}
                  {player.rank > 3 && player.rank}
                </TableCell>
                <TableCell className="text-lg">{player.name}</TableCell>
                <TableCell className="text-right text-lg text-primary font-bold">
                  {player.score.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
