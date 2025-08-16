"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import Header from "@/components/Header"
import { BottomNav } from "@/components/BottomNav"

// Helper function to format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [quizHistory, setQuizHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return
      
      try {
        // Get user stats
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
          setStats(userDoc.data())
        }
        
        // Get quiz history from user's completedQuizzes subcollection
        const completedQuizzesRef = collection(db, "users", user.uid, "completedQuizzes")
        const completedSnapshot = await getDocs(completedQuizzesRef)
        
        const historyData = completedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().completedAt?.toDate?.() || new Date()
        }))
        
        // Sort by most recent
        historyData.sort((a, b) => b.date - a.date)
        setQuizHistory(historyData)

        // Get user's rank by comparing total score with all users
        const usersRef = collection(db, "users")
        const usersSnapshot = await getDocs(usersRef)
        const allUsers = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }))
        
        // Sort by total score and find user's rank
        allUsers.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
        const userRank = allUsers.findIndex(u => u.uid === user.uid) + 1
        
        setStats(prev => ({
          ...prev,
          rank: userRank
        }))
        
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [user])
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You need to sign in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Go to login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="pb-24 md:pb-0">
      <Header />
      <main className="container max-w-lg mx-auto p-4">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.photoURL || ""} />
                <AvatarFallback>{user.displayName?.[0] || user.email?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user.displayName || "QuizWiz User"}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <span className="text-xl font-bold">{formatNumber(stats?.totalScore || 0)}</span>
                <span className="text-xs text-muted-foreground text-center">Total Points</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <span className="text-xl font-bold">{stats?.quizzesSolved || 0}</span>
                <span className="text-xs text-muted-foreground text-center">Quizzes</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <span className="text-xl font-bold">#{stats?.rank || "-"}</span>
                <span className="text-xs text-muted-foreground text-center">Rank</span>
              </div>
            </div>
            
            {stats?.badges && stats.badges.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.badges.map((badge: string, i: number) => (
                    <Badge key={i} variant="secondary">{badge}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Tabs defaultValue="history">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="history">Quiz History</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <ScrollArea className="h-[400px] rounded-md border px-1">
              <div className="p-4 pr-3">
                {quizHistory.length > 0 ? (
                  <div className="space-y-4">
                    {quizHistory.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">{item.topic || "Quiz"}</CardTitle>
                            <Badge variant={item.score > 500 ? "default" : "outline"}>
                              {item.score} pts
                            </Badge>
                          </div>
                          <CardDescription>
                            {item.date.toLocaleDateString()} • {item.difficulty || "Unknown"}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No quiz history found. Start taking quizzes to see your progress!
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Track your progress and unlock rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] px-1">
                  <div className="space-y-4 pr-3">
                    {[
                      { name: "First Steps", desc: "Complete your first quiz", progress: (stats?.quizzesSolved || 0) >= 1 ? 1 : 0, emoji: "🎯" },
                      { name: "Getting Started", desc: "Complete 5 quizzes", progress: (stats?.quizzesSolved || 0) / 5, emoji: "🚀" },
                      { name: "Quiz Master", desc: "Complete 10 quizzes", progress: (stats?.quizzesSolved || 0) / 10, emoji: "🎓" },
                      { name: "Quiz Expert", desc: "Complete 25 quizzes", progress: (stats?.quizzesSolved || 0) / 25, emoji: "🏆" },
                      { name: "Quiz Legend", desc: "Complete 50 quizzes", progress: (stats?.quizzesSolved || 0) / 50, emoji: "👑" },
                      { name: "Century Club", desc: "Complete 100 quizzes", progress: (stats?.quizzesSolved || 0) / 100, emoji: "💯" },
                      { name: "Point Starter", desc: "Earn 1,000 points", progress: (stats?.totalScore || 0) / 1000, emoji: "⭐" },
                      { name: "Point Collector", desc: "Earn 5,000 points", progress: (stats?.totalScore || 0) / 5000, emoji: "🌟" },
                      { name: "Point Master", desc: "Earn 10,000 points", progress: (stats?.totalScore || 0) / 10000, emoji: "✨" },
                      { name: "Point Legend", desc: "Earn 25,000 points", progress: (stats?.totalScore || 0) / 25000, emoji: "💫" },
                      { name: "Point God", desc: "Earn 50,000 points", progress: (stats?.totalScore || 0) / 50000, emoji: "🌠" },
                      { name: "Perfect Score", desc: "Get 100% on any quiz", progress: stats?.hasCompletedPerfectQuiz ? 1 : 0, emoji: "🎯" },
                      { name: "Speed Demon", desc: "Complete a quiz in under 2 minutes", progress: stats?.fastestCompletion ? 1 : 0, emoji: "⚡" },
                      { name: "Streak Master", desc: "Get a 5-question streak", progress: stats?.maxStreak >= 5 ? 1 : 0, emoji: "🔥" },
                      { name: "Daily Player", desc: "Play for 3 consecutive days", progress: (stats?.consecutiveDays || 0) / 3, emoji: "📅" },
                      { name: "Weekly Warrior", desc: "Play for 7 consecutive days", progress: (stats?.consecutiveDays || 0) / 7, emoji: "🗓️" },
                      { name: "Monthly Master", desc: "Play for 30 consecutive days", progress: (stats?.consecutiveDays || 0) / 30, emoji: "📆" },
                      { name: "Top 10", desc: "Reach top 10 on leaderboard", progress: (stats?.rank && stats?.rank <= 10) ? 1 : 0, emoji: "🏅" },
                      { name: "Top 3", desc: "Reach top 3 on leaderboard", progress: (stats?.rank && stats?.rank <= 3) ? 1 : 0, emoji: "🥉" },
                      { name: "Champion", desc: "Reach #1 on leaderboard", progress: (stats?.rank && stats?.rank === 1) ? 1 : 0, emoji: "🥇" },
                      { name: "Store Visitor", desc: "Purchase your first perk", progress: stats?.firstPerkPurchased ? 1 : 0, emoji: "🛒" },
                      { name: "Big Spender", desc: "Spend 10,000 points in store", progress: (stats?.totalSpent || 0) / 10000, emoji: "💰" },
                      { name: "Early Bird", desc: "Complete a quiz before 9 AM", progress: stats?.earlyBirdQuiz ? 1 : 0, emoji: "🌅" },
                      { name: "Night Owl", desc: "Complete a quiz after 11 PM", progress: stats?.nightOwlQuiz ? 1 : 0, emoji: "🦉" },
                      { name: "Difficulty Explorer", desc: "Try all difficulty levels", progress: (stats?.difficultiesTried || 0) / 7, emoji: "🎢" },
                    ].map((achievement, i) => (
                      <div key={i} className="space-y-2 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{achievement.emoji}</span>
                            <span className="font-medium">{achievement.name}</span>
                            {achievement.progress >= 1 && <span className="text-green-500 text-sm">✓</span>}
                          </div>
                          <span className="text-xs text-muted-foreground">{Math.min(100, Math.round(achievement.progress * 100))}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${achievement.progress >= 1 ? 'bg-green-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min(100, Math.round(achievement.progress * 100))}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full" onClick={() => {
            if (window.confirm("Are you sure you want to sign out?")) {
              // Sign out logic
            }
          }}>
            Sign Out
          </Button>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
