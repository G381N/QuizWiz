
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Crown, Loader2, Star, Search, User as UserIcon, Trophy } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { type OverallLeaderboardEntry } from '@/types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// Helper function to format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

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
    if (!searchTerm) {
      return leaderboard;
    }
    return leaderboard.filter(player => player.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [leaderboard, searchTerm]);
  
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
  
  const firstPlace = leaderboard.find(p => p.rank === 1);
  const secondPlace = leaderboard.find(p => p.rank === 2);
  const thirdPlace = leaderboard.find(p => p.rank === 3);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-700">
        <div className="space-y-4 animate-in slide-in-from-top-5 duration-500">
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <UserStatsCard userRank={currentUserRank} />
        </div>
      
      <div className="relative flex justify-center items-end gap-2 md:gap-4 min-h-[200px] md:min-h-[300px]">
          <div className="animate-in zoom-in-50 duration-500 delay-500">
            <PodiumCard player={secondPlace} rank={2} />
          </div>
          <div className="animate-in zoom-in duration-500">
            <PodiumCard player={firstPlace} rank={1} />
          </div>
          <div className="animate-in zoom-in-50 duration-500 delay-500">
            <PodiumCard player={thirdPlace} rank={3} />
          </div>
      </div>
      
      <div className="relative animate-in slide-in-from-bottom-5 duration-500 delay-500">
          <Input 
              placeholder="Search for a player..." 
              className="pl-10 h-11 text-base w-full bg-secondary/30" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      <div className="bg-secondary/30 rounded-2xl border border-border animate-in slide-in-from-bottom-5 duration-500 delay-700">
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
            {filteredLeaderboard.length > 0 ? filteredLeaderboard.map((player, index) => (
              <TableRow 
                key={player.rank} 
                className="font-medium border-b-0 hover:bg-white/5 animate-in fade-in-50" 
                style={{ animationDelay: `${300 + (index * 30)}ms` }}
              >
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
                   {searchTerm ? `No player named "${searchTerm}" found.` : 'The leaderboard is just getting started!'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


const PodiumCard = ({player, rank}: {player: OverallLeaderboardEntry | undefined, rank: number}) => {
    const [isMobile, setIsMobile] = React.useState(false);
    
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    const rankConfig = {
        1: { 
            border: 'border-yellow-400 border-4', 
            text: 'text-yellow-400', 
            icon: <Crown className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 mb-2 md:mb-3 drop-shadow-lg animate-pulse" />, 
            size: 'w-32 md:w-56', 
            imageSize: { mobile: 100, desktop: 140 },
            containerClass: 'transform scale-100 md:scale-110 z-10 relative order-2',
            delay: 'animation-delay-200'
        },
        2: { 
            border: 'border-slate-400 border-3', 
            text: 'text-slate-400', 
            icon: <TrophyIcon color="#C0C0C0" className="w-5 h-5 md:w-8 md:h-8 mb-1 md:mb-2" />, 
            size: 'w-24 md:w-40 mt-8 md:mt-12', 
            imageSize: { mobile: 70, desktop: 100 },
            containerClass: 'transform scale-100 z-5 relative order-1',
            delay: 'animation-delay-100'
        },
        3: { 
            border: 'border-amber-600 border-3', 
            text: 'text-amber-600', 
            icon: <TrophyIcon color="#CD7F32" className="w-5 h-5 md:w-8 md:h-8 mb-1 md:mb-2" />, 
            size: 'w-24 md:w-40 mt-8 md:mt-12', 
            imageSize: { mobile: 70, desktop: 100 },
            containerClass: 'transform scale-100 z-5 relative order-3',
            delay: 'animation-delay-300'
        },
    };
    
    const config = rankConfig[rank as keyof typeof rankConfig];
    const imageSize = isMobile ? config.imageSize.mobile : config.imageSize.desktop;

    if (!player) {
      return (
         <div className={cn(
            "flex flex-col items-center text-center transition-all duration-500 hover:scale-105",
            config.size,
            config.containerClass
        )}>
            <div className={cn("animate-in fade-in-0 slide-in-from-bottom-10 duration-700", config.delay)}>
                {config.icon}
                <div className={cn("rounded-full bg-gradient-to-b from-background/80 to-secondary/50 flex items-center justify-center shadow-lg", config.border)} style={{width: imageSize, height: imageSize}}>
                    <Trophy className={cn("w-1/2 h-1/2", config.text, "opacity-50")} />
                </div>
                <p className="mt-2 md:mt-4 font-bold text-xs md:text-lg text-muted-foreground">Vacant</p>
                <p className={cn("text-sm md:text-xl font-extrabold", config.text)}>--- PTS</p>
            </div>
        </div>
      )
    }

    return (
        <div className={cn(
            "flex flex-col items-center text-center transition-all duration-300 hover:scale-105 group",
            config.size,
            config.containerClass
        )}>
            <div className="flex flex-col items-center">
                <div className="animate-in fade-in duration-500 delay-100">
                    {config.icon}
                </div>
                <div className="relative animate-in fade-in-50 duration-700 delay-200">
                    <Image 
                        src={player.avatar || '/default-avatar.png'} 
                        alt={player.name} 
                        width={imageSize}
                        height={imageSize}
                        className={cn(
                            "rounded-full bg-gradient-to-b from-background/80 to-secondary/50 shadow-lg",
                            config.border
                        )}
                    />
                    {rank === 1 && (
                        <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-black font-bold text-xs md:text-sm">👑</span>
                        </div>
                    )}
                </div>
                <div className="animate-in fade-in-50 duration-700 delay-300 mt-2 md:mt-4">
                    <p className="font-bold text-xs md:text-lg">{player.name}</p>
                    <p className={cn("text-sm md:text-xl font-extrabold", config.text)}>{formatNumber(player.totalScore)} PTS</p>
                    <p className="text-[10px] md:text-sm text-muted-foreground hidden md:block">{player.quizzesSolved} quizzes solved</p>
                </div>
            </div>
        </div>
    )
}

const UserStatsCard = ({ userRank }: { userRank: OverallLeaderboardEntry | null }) => {
    if (!userRank) {
        return (
            <Card className="bg-secondary/30">
                <CardContent className="p-4 flex items-center justify-center">
                    <p className="text-muted-foreground">Play a quiz to get ranked!</p>
                </CardContent>
            </Card>
        );
    }
    return (
        <Card className="bg-secondary/30 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-4 animate-in slide-in-from-left duration-500">
                    <Image src={userRank.avatar} alt={userRank.name} width={48} height={48} className="rounded-full border-2 border-primary" />
                    <div>
                        <p className="text-lg font-bold">{userRank.name}</p>
                        <p className="text-sm text-muted-foreground">Your Current Standing</p>
                    </div>
                </div>
            
                <div className="grid grid-cols-3 divide-x divide-border bg-background/30 rounded-lg p-2 animate-in slide-in-from-right duration-500">
                    <div className="flex flex-col items-center px-4 animate-in fade-in-50 duration-700">
                        <p className="text-xs text-muted-foreground">Rank</p>
                        <p className="text-xl font-bold text-primary">#{userRank.rank}</p>
                    </div>
                    <div className="flex flex-col items-center px-4 animate-in fade-in-50 duration-700 delay-100">
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="text-xl font-bold">{userRank.totalScore.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-center px-4 animate-in fade-in-50 duration-700 delay-200">
                        <p className="text-xs text-muted-foreground">Quizzes</p>
                        <p className="text-xl font-bold">{userRank.quizzesSolved}</p>
                    </div>
                </div>
            </div>
        </Card>
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
    
