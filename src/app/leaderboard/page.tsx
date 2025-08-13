
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Crown, Trophy, Loader2, Star, Search } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { type OverallLeaderboardEntry } from '@/types';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = React.useState<OverallLeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), orderBy('totalScore', 'desc'));
        const querySnapshot = await getDocs(q);
        const leaderboardData: OverallLeaderboardEntry[] = [];
        let rank = 1;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          leaderboardData.push({
            rank: rank++,
            name: data.displayName,
            quizzesSolved: data.quizzesSolved || 0,
            avatar: data.photoURL,
            totalScore: data.totalScore || 0,
          });
        });
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error("Failed to fetch overall leaderboard", error);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const filteredLeaderboard = React.useMemo(() => {
    return leaderboard.filter(player => player.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [leaderboard, searchTerm]);
  
  const topPlayers = filteredLeaderboard.slice(0,3);
  const restPlayers = filteredLeaderboard.slice(3);


  if (loading) {
    return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-4">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Overall Leaderboard</h1>
        </div>
        <div className="relative w-full md:max-w-xs">
            <Input 
                placeholder="Search players..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      
      {/* Top 3 Players */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        {topPlayers.map((player, index) => (
            <Card key={player.rank} className="bg-secondary/50 border-border relative pt-10">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                    <Image src={player.avatar || '/default-avatar.png'} alt={player.name} width={64} height={64} className="rounded-full border-4" style={{borderColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}}/>
                    {index === 0 && <Crown className="w-8 h-8 text-yellow-400 absolute -top-5 -right-3 rotate-12" />}
                </div>
                <CardContent className="space-y-2">
                    <p className="text-lg font-bold">{player.name}</p>
                    <p className="text-2xl font-extrabold text-primary">{player.totalScore.toLocaleString()} PTS</p>
                    <p className="text-sm text-muted-foreground">{player.quizzesSolved} quizzes solved</p>
                </CardContent>
            </Card>
        ))}
      </div>


      {/* Rest of the Leaderboard */}
      <div className="bg-secondary/50 rounded-2xl border border-border">
        <Table>
          <TableHeader>
             <TableRow className="border-b-border/50">
                <TableHead className="w-24 text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Quizzes Solved</TableHead>
                <TableHead className="text-right">Total Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restPlayers.length > 0 ? restPlayers.map((player) => (
              <TableRow key={player.rank} className="font-medium border-b-0 hover:bg-white/5">
                <TableCell className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center text-lg font-bold bg-background/50">
                        {player.rank}
                    </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Image src={player.avatar || '/default-avatar.png'} alt={player.name} width={40} height={40} className="rounded-full"/>
                    <p className="text-base font-semibold">{player.name}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center text-base text-muted-foreground">
                    {player.quizzesSolved}
                </TableCell>
                <TableCell className="text-right text-base text-primary font-bold">
                  <div className="flex items-center justify-end gap-2">
                    <Star className="w-4 h-4" />
                    <span>{player.totalScore.toLocaleString()} PTS</span>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {filteredLeaderboard.length > 0 ? 'No other players found.' : 'The leaderboard is empty. Be the first to solve a quiz!'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
