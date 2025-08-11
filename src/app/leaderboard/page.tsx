import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Crown } from 'lucide-react';
import Image from 'next/image';

const mockLeaderboard = [
  { rank: 1, name: 'Orenji Tomomi', score: 950, level: 8, avatar: '/avatars/1.svg' },
  { rank: 2, name: 'Toru', score: 756, level: 5, avatar: '/avatars/2.svg' },
  { rank: 3, name: 'Natsumi', score: 650, level: 3, avatar: '/avatars/3.svg' },
  { rank: 4, name: 'Nezuko', score: 468, level: 5, avatar: '/avatars/4.svg' },
  { rank: 5, name: 'Tomioka', score: 273, level: 9, avatar: '/avatars/5.svg' },
  { rank: 6, name: 'Miu', score: 250, level: 2, avatar: '/avatars/6.svg' },
];

const getRankColor = (rank: number) => {
  if (rank === 1) return 'bg-purple-200';
  if (rank === 2) return 'bg-pink-200';
  if (rank === 3) return 'bg-yellow-200';
  return 'bg-gray-100';
}

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Leaderboard</h1>
      </div>
      
      {/* Top 3 */}
      <div className="flex justify-center items-end gap-4 mb-12">
        {mockLeaderboard.slice(1, 2).map(player => (
        <div key={player.rank} className="text-center">
            <div className="relative">
                <Image src={player.avatar} alt={player.name} width={100} height={100} className="rounded-full border-4 border-pink-300 mx-auto"/>
                <div className="absolute -top-2 -right-2 bg-pink-400 text-white text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center">2</div>
            </div>
            <p className="font-bold mt-2">{player.name}</p>
            <p className="text-sm text-muted-foreground">{player.score}px</p>
        </div>
        ))}
        {mockLeaderboard.slice(0, 1).map(player => (
        <div key={player.rank} className="text-center">
            <div className="relative">
                <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 w-10 h-10" />
                <Image src={player.avatar} alt={player.name} width={120} height={120} className="rounded-full border-4 border-purple-400 mx-auto"/>
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xl font-bold w-10 h-10 rounded-full flex items-center justify-center">1</div>
            </div>
            <p className="font-bold mt-2 text-lg">{player.name}</p>
            <p className="text-sm text-muted-foreground">{player.score}px</p>
        </div>
        ))}
        {mockLeaderboard.slice(2, 3).map(player => (
        <div key={player.rank} className="text-center">
            <div className="relative">
                <Image src={player.avatar} alt={player.name} width={100} height={100} className="rounded-full border-4 border-yellow-300 mx-auto"/>
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center">3</div>
            </div>
            <p className="font-bold mt-2">{player.name}</p>
            <p className="text-sm text-muted-foreground">{player.score}px</p>
        </div>
        ))}
      </div>

      <div className="bg-card rounded-3xl border shadow-lg p-2">
        <Table>
          <TableHeader className="hidden">
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLeaderboard.map((player) => (
              <TableRow key={player.rank} className="font-medium border-b-0 hover:bg-purple-50 rounded-2xl">
                <TableCell className="w-16 text-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${getRankColor(player.rank)}`}>
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
                  {player.score.toLocaleString()}px
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
