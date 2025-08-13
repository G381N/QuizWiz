
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Crown, Loader2, Star, Search, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { type OverallLeaderboardEntry } from '@/types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = React.useState<OverallLeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { user } = useAuth();

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
            id: doc.id,
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
  
  const topThree = filteredLeaderboard.slice(0,3);
  const restOfPlayers = filteredLeaderboard.slice(3);

  const currentUserRank = React.useMemo(() => {
    if (!user) return null;
    return leaderboard.find(p => p.id === user.uid) || null;
  }, [leaderboard, user]);


  if (loading) {
    return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }
  
  const firstPlace = topThree.find(p => p.rank === 1);
  const secondPlace = topThree.find(p => p.rank === 2);
  const thirdPlace = topThree.find(p => p.rank === 3);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Leaderboard</h1>
        <p className="mt-2 text-muted-foreground">See who's at the top of their game</p>
      </div>
      
      {topThree.length > 0 && (
        <div className="flex justify-center items-end gap-4 md:gap-8 min-h-[250px]">
            {secondPlace && <PodiumCard player={secondPlace} rank={2} />}
            {firstPlace && <PodiumCard player={firstPlace} rank={1} />}
            {thirdPlace && <PodiumCard player={thirdPlace} rank={3} />}
        </div>
      )}
      
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-secondary/50 border-primary/30">
          <CardContent className="p-4 flex items-center gap-4">
             <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold bg-primary/10 text-primary">
                {currentUserRank ? currentUserRank.rank : <UserIcon className="w-6 h-6"/>}
            </div>
            <div className="flex-grow">
              <p className="font-bold">{currentUserRank ? currentUserRank.name : 'Your Rank'}</p>
              <p className="text-sm text-primary font-bold">{currentUserRank ? `${currentUserRank.totalScore.toLocaleString()} PTS` : 'Play a quiz to get ranked!'}</p>
            </div>
          </CardContent>
        </Card>

        <div className="relative md:col-span-2">
            <Input 
                placeholder="Search for a player..." 
                className="pl-10 h-full text-base" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="bg-secondary/30 rounded-2xl border border-border">
        <Table>
          <TableHeader>
             <TableRow className="border-b-border/50">
                <TableHead className="w-24 text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Quizzes Solved</TableHead>
                <TableHead className="text-right">Total Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restOfPlayers.length > 0 ? restOfPlayers.map((player) => (
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
                <TableCell className="text-center text-base text-muted-foreground hidden sm:table-cell">
                    {player.quizzesSolved}
                </TableCell>
                <TableCell className="text-right text-base text-primary font-bold">
                  <div className="flex items-center justify-end gap-2">
                    <Star className="w-4 h-4" />
                    <span>{player.totalScore.toLocaleString()}</span>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {filteredLeaderboard.length > 3 ? 'No other players found.' : 'The leaderboard is just getting started!'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


const PodiumCard = ({player, rank}: {player: OverallLeaderboardEntry, rank: number}) => {
    const rankConfig = {
        1: { border: 'border-yellow-400', text: 'text-yellow-400', icon: <Crown className="w-10 h-10 text-yellow-400 mb-2 drop-shadow-lg" />, size: 'w-48', imageSize: 100 },
        2: { border: 'border-slate-400', text: 'text-slate-400', icon: <TrophyIcon color="#C0C0C0" className="w-8 h-8 mb-2" />, size: 'w-40 mt-8', imageSize: 80 },
        3: { border: 'border-amber-600', text: 'text-amber-600', icon: <TrophyIcon color="#CD7F32" className="w-8 h-8 mb-2" />, size: 'w-40 mt-8', imageSize: 80 },
    };
    
    const config = rankConfig[rank as keyof typeof rankConfig];

    return (
        <div className={cn(
            "flex flex-col items-center text-center transition-all duration-300 animate-in fade-in-0 zoom-in-75",
            config.size
        )}>
            {config.icon}
            <Image 
                src={player.avatar || '/default-avatar.png'} 
                alt={player.name} 
                width={config.imageSize}
                height={config.imageSize}
                className={cn(
                    "rounded-full border-4 bg-background/50",
                    config.border
                )}
            />
            <p className="mt-3 font-bold text-lg">{player.name}</p>
            <p className={cn("text-2xl font-extrabold", config.text)}>{player.totalScore.toLocaleString()} PTS</p>
            <p className="text-sm text-muted-foreground">{player.quizzesSolved} quizzes solved</p>
        </div>
    )
}

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
