import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Award, Trophy } from 'lucide-react';
import Image from 'next/image';

const mockLeaderboard = [
  { rank: 1, name: 'CygnusX1', score: 9850, level: 8, avatar: '/avatars/1.svg' },
  { rank: 2, name: 'Vortex', score: 9756, level: 5, avatar: '/avatars/2.svg' },
  { rank: 3, name: 'Nebula', score: 8650, level: 7, avatar: '/avatars/3.svg' },
  { rank: 4, name: 'Pulsar', score: 7468, level: 5, avatar: '/avatars/4.svg' },
  { rank: 5, name: 'Quasar', score: 6273, level: 9, avatar: '/avatars/5.svg' },
  { rank: 6, name: 'Orbit', score: 5250, level: 2, avatar: '/avatars/6.svg' },
];

const getRankColor = (rank: number) => {
  if (rank === 1) return 'bg-yellow-500/20 text-yellow-400';
  if (rank === 2) return 'bg-gray-400/20 text-gray-300';
  if (rank === 3) return 'bg-orange-600/20 text-orange-500';
  return 'bg-secondary';
}

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Trophy className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
      </div>
      
      {/* Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* 2nd Place */}
        <div className="bg-secondary p-6 rounded-2xl border border-border text-center flex flex-col items-center justify-end animate-in fade-in-50 slide-in-from-bottom-10 delay-300 duration-500">
          <Image src={mockLeaderboard[1].avatar} alt={mockLeaderboard[1].name} width={90} height={90} className="rounded-full border-4 border-gray-400 mx-auto -mt-12"/>
          <div className="mt-4">
              <div className="text-sm font-bold text-gray-400">2nd Place</div>
              <p className="font-bold text-xl mt-1">{mockLeaderboard[1].name}</p>
              <p className="text-2xl font-bold text-primary mt-2">{mockLeaderboard[1].score.toLocaleString()} PTS</p>
          </div>
        </div>

        {/* 1st Place */}
        <div className="bg-primary/10 p-6 rounded-2xl border-2 border-primary text-center flex flex-col items-center justify-end relative animate-in fade-in-50 slide-in-from-bottom-10 delay-150 duration-500">
          <Award className="absolute -top-6 text-primary w-12 h-12" />
          <Image src={mockLeaderboard[0].avatar} alt={mockLeaderboard[0].name} width={120} height={120} className="rounded-full border-4 border-primary mx-auto -mt-16"/>
          <div className="mt-4">
              <div className="text-sm font-bold text-primary">1st Place</div>
              <p className="font-bold text-2xl mt-1">{mockLeaderboard[0].name}</p>
              <p className="text-3xl font-bold text-primary mt-2">{mockLeaderboard[0].score.toLocaleString()} PTS</p>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="bg-secondary p-6 rounded-2xl border border-border text-center flex flex-col items-center justify-end animate-in fade-in-50 slide-in-from-bottom-10 delay-500 duration-500">
          <Image src={mockLeaderboard[2].avatar} alt={mockLeaderboard[2].name} width={90} height={90} className="rounded-full border-4 border-orange-600 mx-auto -mt-12"/>
          <div className="mt-4">
              <div className="text-sm font-bold text-orange-500">3rd Place</div>
              <p className="font-bold text-xl mt-1">{mockLeaderboard[2].name}</p>
              <p className="text-2xl font-bold text-primary mt-2">{mockLeaderboard[2].score.toLocaleString()} PTS</p>
          </div>
        </div>
      </div>

      <div className="bg-secondary rounded-2xl border border-border">
        <Table>
          <TableHeader>
             <TableRow className="border-b-border/50">
                <TableHead className="w-24 text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLeaderboard.slice(3).map((player) => (
              <TableRow key={player.rank} className="font-medium border-b-0 hover:bg-white/5">
                <TableCell className="text-center">
                    <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center text-lg font-bold ${getRankColor(player.rank)}`}>
                        {player.rank}
                    </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Image src={player.avatar} alt={player.name} width={48} height={48} className="rounded-full"/>
                    <div>
                        <p className="text-lg font-semibold">{player.name}</p>
                        <p className="text-sm text-muted-foreground">Level {player.level}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right text-lg text-primary font-bold">
                  {player.score.toLocaleString()} PTS
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
