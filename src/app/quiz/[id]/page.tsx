
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, X, Clock, Loader2, ArrowLeft, ShieldCheck, Zap, Star, HelpCircle, SkipForward, ShieldAlert } from 'lucide-react';
import { type Quiz, type UserPerks, type Attack } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, updateDoc, runTransaction, increment, collection, query, where, getDocs, writeBatch, serverTimestamp, setDoc, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { db } from '@/lib/firebase';


const DEFAULT_TIME_PER_QUESTION = 15; // seconds (keeping original time)
const ATTACKED_TIME_PER_QUESTION = 5;
const POINTS_PER_SECOND = 15; // Base points per second remaining (reduced from 25)
const STREAK_BONUS = 60; // Bonus for consecutive correct answers (reduced from 100)
const TIME_DANGER_THRESHOLD = 5;
const WRONG_ANSWER_PENALTY = -100; // Penalty for wrong answers (increased from -50)
const CONSECUTIVE_WRONG_PENALTY = -250; // Additional penalty for 3 wrong answers in a row (increased from -150)

// Balanced difficulty multipliers that make higher difficulties rewarding but fair
const DIFFICULTY_MULTIPLIER: { [key: string]: number } = {
    'dumb-dumb': 0.4,     // Casual fun mode (reduced from 0.5)
    'novice': 0.6,        // For beginners (reduced from 0.8)
    'beginner': 0.8,      // Standard difficulty (reduced from 1.0)
    'intermediate': 1.2,  // Requires topic knowledge (reduced from 1.5)
    'advanced': 1.6,      // Challenging questions (reduced from 2.0)
    'expert': 2.2,        // Very difficult questions (reduced from 3.0)
    'point-farming': 2.8, // Maximum difficulty for maximum points (reduced from 4.0)
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.id as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [score, setScore] = React.useState(0);
  const [timePerQuestion, setTimePerQuestion] = React.useState(DEFAULT_TIME_PER_QUESTION);
  const [timeLeft, setTimeLeft] = React.useState(DEFAULT_TIME_PER_QUESTION);
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [isExitDialogVisible, setIsExitDialogVisible] = React.useState(false);
  const [streak, setStreak] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [userPerks, setUserPerks] = React.useState<UserPerks>({});
  const [shuffledOptions, setShuffledOptions] = React.useState<string[]>([]);
  const [activeAttack, setActiveAttack] = React.useState<Attack | null>(null);
  const [isScoreBoosterActive, setIsScoreBoosterActive] = React.useState(false);
  const [wrongAnswersCount, setWrongAnswersCount] = React.useState(0);
  const [quizAttemptTime, setQuizAttemptTime] = React.useState<Date | null>(null);
  const [powerupMenuOpen, setPowerupMenuOpen] = React.useState(false);
  
  const timerRef = React.useRef<NodeJS.Timeout>();
  const totalScoreRef = React.useRef(0);

  React.useEffect(() => {
    const fetchQuizAndUserData = async () => {
      if (!quizId || !user) return;
      setIsLoading(true);
      try {
        const quizDocRef = doc(db, 'quizzes', quizId);
        const userDocRef = doc(db, 'users', user.uid);
        
        const [quizDocSnap, userDocSnap] = await Promise.all([
            getDoc(quizDocRef),
            getDoc(userDocRef)
        ]);
        
        if (!quizDocSnap.exists()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Quiz not found.' });
            router.push('/dashboard');
            return;
        }

        const quizData = { id: quizDocSnap.id, ...quizDocSnap.data() } as Quiz;
        setQuiz(quizData);

        // Check for recent attempts (24-hour cooldown)
        const attemptsRef = collection(db, 'quizAttempts');
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Use a simpler query that doesn't require a complex index
        const attemptQuery = query(
          attemptsRef, 
          where('userId', '==', user.uid),
          where('quizId', '==', quizId)
        );
        
        const attemptSnap = await getDocs(attemptQuery);
        // Filter for recent attempts in JavaScript instead of in the query
        const recentAttempts = attemptSnap.docs.filter(
          doc => doc.data().attemptTime.toDate() >= yesterday
        );
        
        if (recentAttempts.length > 0) {
          // Sort by attemptTime in descending order to get the most recent attempt
          const sortedAttempts = recentAttempts.sort((a, b) => 
            b.data().attemptTime.toDate().getTime() - a.data().attemptTime.toDate().getTime()
          );
          const lastAttempt = sortedAttempts[0].data().attemptTime.toDate();
          const hoursLeft = Math.ceil((24 - (today.getTime() - lastAttempt.getTime()) / 1000 / 60 / 60));
          
          toast({ 
            variant: 'destructive', 
            title: 'Quiz on Cooldown', 
            description: `You can try this quiz again in ${hoursLeft} hours.` 
          });
          router.push('/dashboard');
          return;
        }
        
        // Check for recent quits (20-minute cooldown)
        const quitsRef = collection(db, 'quizQuits');
        const twentyMinutesAgo = new Date(today);
        twentyMinutesAgo.setMinutes(today.getMinutes() - 20);
        
        const quitQuery = query(
          quitsRef,
          where('userId', '==', user.uid),
          where('quizId', '==', quizId)
        );
        
        const quitSnap = await getDocs(quitQuery);
        const recentQuits = quitSnap.docs.filter(
          doc => doc.data().quitTime?.toDate() >= twentyMinutesAgo
        );
        
        if (recentQuits.length > 0) {
          // Sort to get most recent quit
          const sortedQuits = recentQuits.sort((a, b) => 
            b.data().quitTime.toDate().getTime() - a.data().quitTime.toDate().getTime()
          );
          const lastQuit = sortedQuits[0].data().quitTime.toDate();
          const minutesLeft = Math.ceil((20 - (today.getTime() - lastQuit.getTime()) / 1000 / 60));
          
          // Use a local variable to store the message
          const cooldownMessage = `You recently quit this quiz. You can try again in ${minutesLeft} minutes.`;
          
          // Show toast after the component is mounted
          setTimeout(() => {
            toast({
              variant: 'destructive',
              title: 'Quiz Cooldown',
              description: cooldownMessage
            });
          }, 0);
          
          router.push('/dashboard');
          return;
        }
        
        // Record this attempt
        setQuizAttemptTime(today);

        const completionKey = `${quizData.topic}_${quizData.difficulty}`;
        const completedDocRef = doc(userDocRef, 'completedQuizzes', completionKey);
        const completedDocSnap = await getDoc(completedDocRef);

        if (completedDocSnap.exists()) {
            setIsCompleted(true);
            setIsLoading(false);
            return;
        }
        
        // Check for active time attacks
        const attacksRef = collection(db, 'attacks');
        const q = query(attacksRef, where('targetId', '==', user.uid), where('used', '==', false));
        const attackSnapshot = await getDocs(q);
        if (!attackSnapshot.empty) {
            const attackDoc = attackSnapshot.docs[0];
            const attackData = { id: attackDoc.id, ...attackDoc.data() } as Attack;
            setActiveAttack(attackData);
            setTimePerQuestion(ATTACKED_TIME_PER_QUESTION);
            setTimeLeft(ATTACKED_TIME_PER_QUESTION);
            // Store message in local variable
            const attackMessage = `${attackData.attackerName} used a Time Attack! You only have 5 seconds per question.`;
            
            // Update document first
            await updateDoc(doc(db, 'attacks', attackDoc.id), { used: true });
            
            // Then show toast after component is mounted
            setTimeout(() => {
                toast({
                    title: 'You are under attack!',
                    description: attackMessage,
                    variant: 'destructive',
                    duration: 5000,
                });
            }, 0);
        }


        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserPerks(userData.perks || {});
             if (userData.perks?.['score-booster-active']) {
                setIsScoreBoosterActive(true);
                await updateDoc(userDocRef, { 'perks.score-booster-active': false }); // Consume it
                
                // Show toast after component is mounted
                setTimeout(() => {
                    toast({ 
                        title: 'Score Booster Active!', 
                        description: 'Your points for this quiz will be doubled!' 
                    });
                }, 0);
            }
        }
      } catch (error) {
        console.error("Failed to load quiz", error);
        
        // Show toast after component is mounted
        setTimeout(() => {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load quiz.' });
        }, 0);
        
        router.push('/dashboard');
      }
      setIsLoading(false);
    };
    if (user && quizId) {
        fetchQuizAndUserData();
    }
  }, [quizId, router, user, toast]);
  
  React.useEffect(() => {
    if (quiz) {
      const currentQuestion = quiz.questions[currentQuestionIndex];
      setShuffledOptions(currentQuestion.options.sort(() => Math.random() - 0.5));
    }
  }, [quiz, currentQuestionIndex]);

  React.useEffect(() => {
    if (isLoading || isCompleted || isAnswered || !quiz) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Instead of calling handleAnswer directly in setState, flag that time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [currentQuestionIndex, isAnswered, quiz, isLoading, isCompleted]);
  
  // Handle timeout in a separate effect that runs when timeLeft becomes 0
  React.useEffect(() => {
    if (!isAnswered && timeLeft === 0 && !isLoading && !isCompleted && quiz) {
      // This will run after state updates are complete
      handleAnswer(null); // Handle timeout
    }
  }, [timeLeft, isAnswered, isLoading, isCompleted, quiz]);

  const handleNextStep = async () => {
      if (currentQuestionIndex < (quiz?.questions.length ?? 0) - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setIsAnswered(false);
        setSelectedAnswer(null);
        setTimeLeft(timePerQuestion);
      } else {
        if (user) {
          await updateLeaderboards(totalScoreRef.current);
        }
        
        localStorage.setItem(`quiz_score_${quizId}`, totalScoreRef.current.toString());
        router.push(`/quiz/${quizId}/results`);
      }
  }

  const handleAnswer = (answer: string | null) => {
    if (isAnswered || !quiz) return;

    clearInterval(timerRef.current!);
    setIsAnswered(true);
    setSelectedAnswer(answer);

    const currentQuestion = quiz.questions[currentQuestionIndex];
    let points = 0;
    
    if (answer && currentQuestion && answer === currentQuestion.answer) {
      // Correct answer
      const multiplier = DIFFICULTY_MULTIPLIER[quiz.difficulty] || 1;
      points = Math.round(timeLeft * POINTS_PER_SECOND * multiplier);
      
      const currentStreak = streak + 1;
      setStreak(currentStreak);
      setWrongAnswersCount(0); // Reset wrong answers counter
      
      if (currentStreak > 1) {
          const streakBonus = STREAK_BONUS * (currentStreak - 1);
          points += streakBonus;
          // Defer toast calls to avoid React state update during render
          setTimeout(() => {
            toast({ 
              title: `${currentStreak}x Streak!`, 
              description: `+${streakBonus} bonus points!`,
              variant: 'default'
            });
          }, 0);
      }
      
      if (isScoreBoosterActive) {
          const originalPoints = points;
          points *= 2;
          // Defer toast calls 
          setTimeout(() => {
            toast({
              title: "Score Doubled!",
              description: `${originalPoints} → ${points} points`,
              variant: 'default'
            });
          }, 0);
      }
      
      // Show point calculation breakdown
      if (currentStreak <= 1) {
        // Defer toast calls
        setTimeout(() => {
          toast({
            title: "Points Earned",
            description: `${timeLeft}s × ${POINTS_PER_SECOND} × ${multiplier.toFixed(1)} = ${points}`,
            variant: 'default'
          });
        }, 0);
      }
    } else {
      // Wrong answer or timeout
      setStreak(0);
      const currentWrongCount = wrongAnswersCount + 1;
      setWrongAnswersCount(currentWrongCount);
      
      // Apply penalties for wrong answers
      points = WRONG_ANSWER_PENALTY;
      
      // Extra penalty for 3 wrong answers in a row
      if (currentWrongCount >= 3) {
        points += CONSECUTIVE_WRONG_PENALTY;
        // Defer toast call
        setTimeout(() => {
          toast({
            title: "3 Wrong Answers!",
            description: "Extra penalty applied",
            variant: 'destructive'
          });
        }, 0);
        setWrongAnswersCount(0); // Reset after applying penalty
      }
    }
    
    totalScoreRef.current += points;
    setScore(totalScoreRef.current);
    
    setTimeout(() => handleNextStep(), 2000);
  };
  
  const updateLeaderboards = async (finalScore: number) => {
    if (!user || !quiz || !quizAttemptTime) return;

    try {
      await runTransaction(db, async (transaction) => {
        const quizDocRef = doc(db, 'quizzes', quizId);
        const userDocRef = doc(db, "users", user.uid);
        
        // Use a composite key for completed quizzes to track per difficulty
        const completionKey = `${quiz.topic}_${quiz.difficulty}`;
        const completedQuizDocRef = doc(userDocRef, 'completedQuizzes', completionKey);
        
        const quizDoc = await transaction.get(quizDocRef);
        
        if (!quizDoc.exists()) throw "Quiz does not exist!";

        // Mark quiz as completed for the user with the new key
        transaction.set(completedQuizDocRef, { 
            quizId: quiz.id,
            topic: quiz.topic,
            difficulty: quiz.difficulty,
            completedAt: serverTimestamp(), 
            score: finalScore 
        });

        // Record quiz attempt with cooldown
        const attemptDocRef = doc(collection(db, 'quizAttempts'));
        transaction.set(attemptDocRef, {
          userId: user.uid,
          quizId: quizId,
          attemptTime: quizAttemptTime,
          score: finalScore
        });

        // Update quiz-specific leaderboard
        const newEntry = { 
          name: user.displayName || 'Anonymous', 
          score: finalScore, 
          avatar: user.photoURL || '/default-avatar.png',
          userId: user.uid
        };

        const currentLeaderboard = quizDoc.data().leaderboard || [];
        const otherUserEntries = currentLeaderboard.filter((e: any) => e.userId !== user.uid);
        const updatedLeaderboard = [...otherUserEntries, newEntry]
          .sort((a,b) => b.score - a.score)
          .slice(0, 10)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));
        
        transaction.update(quizDocRef, { 
            leaderboard: updatedLeaderboard,
            completions: increment(1)
        });

        // Update user's overall stats
        transaction.update(userDocRef, { 
            quizzesSolved: increment(1),
            totalScore: increment(finalScore),
        });
      });
    } catch (error) {
        console.error("Error updating leaderboards:", error);
        setTimeout(() => {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save your score.' });
        }, 0);
    }
  };

  const useFiftyFifty = async () => {
    if (!quiz || !user || isAnswered) return;
    if (!userPerks['fifty-fifty'] || userPerks['fifty-fifty'] <= 0) {
        setTimeout(() => {
            toast({ variant: 'destructive', title: "No 50/50 perks left!" });
        }, 0);
        return;
    }

    try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
            'perks.fifty-fifty': increment(-1)
        });

        setUserPerks(prev => ({...prev, 'fifty-fifty': (prev['fifty-fifty'] || 1) - 1}));

        const currentQuestion = quiz.questions[currentQuestionIndex];
        const correctAnswer = currentQuestion.answer;
        const incorrectOptions = currentQuestion.options.filter(opt => opt !== correctAnswer);
        const randomIncorrect = incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 1);
        
        const optionsToKeep = [correctAnswer, randomIncorrect[0]];
        setShuffledOptions(currentQuestion.options.filter(opt => optionsToKeep.includes(opt)).sort(() => Math.random() - 0.5));
        
        setTimeout(() => {
            toast({ title: "50/50 Used!", description: "Two incorrect options have been removed." });
        }, 0);

    } catch (error) {
        console.error("Failed to use 50/50 perk", error);
        setTimeout(() => {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not use perk.' });
        }, 0);
    }
  }

  const useSkipQuestion = async () => {
    if (!quiz || !user || isAnswered) return;
    if (!userPerks['skip-question'] || userPerks['skip-question'] <= 0) {
      setTimeout(() => {
        toast({ variant: 'destructive', title: "No Skip perks left!" });
      }, 0);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        'perks.skip-question': increment(-1)
      });
      setUserPerks(prev => ({...prev, 'skip-question': (prev['skip-question'] || 1) - 1}));

      clearInterval(timerRef.current!);
      setIsAnswered(true); // Mark as answered to prevent further interaction
      setSelectedAnswer(null); // No answer selected
      
      setTimeout(() => {
        toast({ title: "Question Skipped!", description: "You will not receive points for this question." });
      }, 0);
      
      setTimeout(() => handleNextStep(), 1500);

    } catch (error) {
      console.error("Failed to use skip perk", error);
      setTimeout(() => {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not use perk.' });
      }, 0);
    }
  }
  
  const useScoreBooster = async () => {
    if (!user || isScoreBoosterActive) return;
    if (!userPerks['score-booster'] || userPerks['score-booster'] <= 0) {
        setTimeout(() => {
            toast({ variant: 'destructive', title: "No Score Booster perks left!" });
        }, 0);
        return;
    }

    try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
            'perks.score-booster': increment(-1),
            'perks.score-booster-active': true
        });

        setUserPerks(prev => ({...prev, 'score-booster': (prev['score-booster'] || 1) - 1}));
        setIsScoreBoosterActive(true);
        
        setTimeout(() => {
            toast({ title: 'Score Booster Activated!', description: 'Your points for this quiz will be doubled!' });
        }, 0);
    } catch (error) {
        console.error("Failed to use score booster perk", error);
        setTimeout(() => {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not use perk.' });
        }, 0);
    }
  }


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isCompleted) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <ShieldCheck className="w-24 h-24 text-primary mb-4" />
            <h1 className="text-3xl font-bold">Quiz Already Completed</h1>
            <p className="text-muted-foreground mt-2">You can only take each quiz once to keep the leaderboards fair.</p>
            <Button onClick={() => router.push(`/quiz/${quizId}/results`)} className="mt-6">
                View Results
            </Button>
        </div>
    )
  }

  if (!quiz) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <p className="text-xl font-semibold">Could not load quiz data.</p>
            <p className="text-muted-foreground mt-2">Please try again later or go back.</p>
             <Button onClick={() => router.push('/dashboard')} className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
        </div>
      )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const getButtonClass = (option: string) => {
    if (!isAnswered) return 'bg-secondary hover:bg-primary/20 border-border hover:border-primary text-foreground/80 hover:text-foreground';

    const isCorrect = option === currentQuestion.answer;
    const isSelected = option === selectedAnswer;

    if(isCorrect) return 'bg-green-500/20 border-green-500 text-white animate-in zoom-in-105';
    if(isSelected) return 'bg-red-500/20 border-red-500 text-white';
    
    return 'bg-secondary opacity-50';
  };
  
  const isTimeDanger = !isAnswered && (timeLeft <= TIME_DANGER_THRESHOLD || (activeAttack && timeLeft <= 2));

  return (
    <TooltipProvider>
    <div 
      className="flex justify-center items-start gap-2 relative quiz-container h-screen overflow-hidden py-1" 
      style={{
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(50, 50, 150, 0.05) 0%, rgba(0, 0, 0, 0) 80%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
        {/* Decorative elements - only visible on larger screens */}
        <div className="hidden xl:block absolute -top-10 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="hidden xl:block absolute top-1/2 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className={cn(
          "w-full max-w-4xl mx-auto space-y-2 animate-in fade-in-50 duration-500 p-2 md:p-3 transition-all",
          isTimeDanger && 'pulse-danger rounded-xl'
        )}>
           <div className="flex items-center justify-between gap-2 bg-secondary/40 p-2 rounded-xl backdrop-blur-sm shadow-lg">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all" 
                  onClick={() => setIsExitDialogVisible(true)}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-grow text-center">
                  <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    {quiz.topic}
                  </h1>
                  <p className="text-xs text-muted-foreground">{`Question ${currentQuestionIndex + 1} of ${quiz.questions.length}`}</p>
                </div>
                <div className="w-20 text-right flex items-center justify-end gap-1 text-base font-bold">
                    <div className="bg-yellow-400/10 p-1 rounded-full flex items-center gap-1 pr-2">
                      <Star className="h-4 w-4 text-yellow-400"/>
                      <span>{score}</span>
                    </div>
                </div>
            </div>
            
            <div className="relative">
              <Progress 
                value={progress} 
                className="h-2 rounded-full bg-secondary/50" 
              />
              <div 
                className="absolute top-0 left-0 h-full bg-primary/20 rounded-full" 
                style={{ 
                  width: `${progress}%`, 
                  boxShadow: '0 0 10px rgba(var(--primary), 0.4)' 
                }}
              ></div>
            </div>
            
            {/* Mobile Powerups Bar */}
            <div className="lg:hidden flex justify-end">
              <Button 
                variant="outline"
                size="sm"
                className="rounded-full bg-secondary/50 border-primary/20"
                onClick={() => setPowerupMenuOpen(!powerupMenuOpen)}
              >
                <Zap className="h-4 w-4 mr-2 text-primary" />
                Powerups
              </Button>
            </div>
            
                    {/* Mobile Powerups Menu */}
                    {powerupMenuOpen && (
                      <div className="md:hidden grid grid-cols-3 gap-2 p-2 rounded-lg bg-secondary/30 border border-border animate-in fade-in-0 slide-in-from-top-5">
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center gap-1 h-auto p-2 bg-background/80"
                          onClick={useFiftyFifty}
                          disabled={isAnswered || shuffledOptions.length <= 2 || (userPerks['fifty-fifty'] ?? 0) <= 0}
                        >
                          <HelpCircle className="h-4 w-4" />
                          <div className="text-xs">50/50</div>
                          <div className="text-xs font-bold">{userPerks['fifty-fifty'] || 0}</div>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center gap-1 h-auto p-2 bg-background/80"
                          onClick={useSkipQuestion}
                          disabled={isAnswered || (userPerks['skip-question'] ?? 0) <= 0}
                        >
                          <SkipForward className="h-4 w-4" />
                          <div className="text-xs">Skip</div>
                          <div className="text-xs font-bold">{userPerks['skip-question'] || 0}</div>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center gap-1 h-auto p-2 bg-background/80"
                          onClick={useScoreBooster}
                          disabled={isAnswered || isScoreBoosterActive || (userPerks['score-booster'] ?? 0) <= 0}
                        >
                          <Zap className={cn("h-4 w-4", isScoreBoosterActive && "text-purple-400")} />
                          <div className="text-xs">2x Score</div>
                          <div className="text-xs font-bold">{userPerks['score-booster'] || 0}</div>
                        </Button>
                      </div>
                    )}            <Card className="shadow-lg border-none rounded-lg bg-secondary/30 backdrop-blur-sm overflow-hidden relative">
                        {/* Decorative elements inside card */}
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-xl"></div>
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-xl"></div>
                        
                        <CardContent className="p-3 sm:p-4 relative z-10">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-secondary/40 p-2 rounded-lg backdrop-blur-sm">
                                    <div className="flex items-center gap-1.5">
                                        {streak > 1 && 
                                          <div className="flex items-center gap-1 bg-orange-400/20 text-orange-400 font-bold animate-in fade-in-0 zoom-in-50 py-0.5 px-2 rounded-full text-xs">
                                            <Zap className="w-3 h-3"/> x{streak}
                                          </div>
                                        }
                                        {activeAttack && 
                                          <div className="flex items-center gap-1 bg-red-500/20 text-red-500 font-bold animate-in fade-in-0 py-0.5 px-2 rounded-full text-xs">
                                            <ShieldAlert className="w-3 h-3"/> Attacked!
                                          </div>
                                        }
                                        {isScoreBoosterActive && 
                                          <div className="flex items-center gap-1 bg-purple-400/20 text-purple-400 font-bold animate-in fade-in-0 py-0.5 px-2 rounded-full text-xs">
                                            <Zap className="w-3 h-3"/> 2x Score!
                                          </div>
                                        }
                                    </div>
                                    <div className={cn(
                                      "flex items-center justify-end gap-1 text-base font-bold transition-all duration-300 py-0.5 px-2 rounded-full",
                                      isTimeDanger 
                                        ? "text-red-500 bg-red-500/10 animate-pulse" 
                                        : "text-primary bg-primary/10"
                                    )}>
                                        <Clock className="h-4 w-4" />
                                        <span>{timeLeft}s</span>
                                    </div>
                                </div>

                                <div className="bg-secondary/40 p-3 rounded-lg backdrop-blur-sm min-h-[120px] flex items-center justify-center shadow-md">
                                  <h2 className="text-xl md:text-2xl text-center font-bold leading-tight">
                                    {currentQuestion.question}
                                  </h2>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {shuffledOptions.map((option, index) => (
                            <Button
                              key={option}
                              onClick={() => handleAnswer(option)}
                              disabled={isAnswered}
                              className={cn(
                                "h-auto p-2 text-sm rounded-lg whitespace-normal justify-start transition-all duration-300 font-semibold border-2",
                                "quiz-option-hover animate-slide-in", 
                                getButtonClass(option),
                                // Slightly staggered animation for each option
                                index === 0 ? "animation-delay-0" :
                                index === 1 ? "animation-delay-100" :
                                index === 2 ? "animation-delay-200" :
                                "animation-delay-300"
                              )}
                              style={{ 
                                animationDelay: `${index * 100}ms`,
                                boxShadow: isAnswered ? 'none' : '0 3px 10px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              <div className="flex items-center w-full">
                                  <div className={cn(
                                    "flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-base mr-2 border border-primary/20",
                                    !isAnswered && "animate-pulse-subtle"
                                  )}>
                                    {String.fromCharCode(65 + index)}
                                  </div>
                                  <span className="flex-grow text-left">{option}</span>
                                  {isAnswered && (
                                    <div className="ml-2 animate-in fade-in zoom-in duration-300">
                                        {option === currentQuestion.answer && 
                                          <div className="bg-green-500/20 p-1 rounded-full animate-pulse-subtle">
                                            <Check className="h-4 w-4 text-green-400" />
                                          </div>
                                        }
                                        {option !== currentQuestion.answer && option === selectedAnswer && 
                                          <div className="bg-red-500/20 p-1 rounded-full">
                                            <X className="h-4 w-4 text-red-400" />
                                          </div>
                                        }
                                    </div>
                                  )}
                              </div>
                            </Button>
                        ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

          <AlertDialog open={isExitDialogVisible} onOpenChange={setIsExitDialogVisible}>
            <AlertDialogContent className="bg-secondary">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to quit?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your progress will be lost and you will not receive any points for this quiz.
                  You will not be able to attempt this quiz again for 20 minutes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                 <Button variant="outline" onClick={() => setIsExitDialogVisible(false)}>Cancel</Button>
                 <Button 
                   variant="destructive" 
                   onClick={async () => {
                     if (user && quizId) {
                       // Record quiz quit with cooldown
                       try {
                         const quitRef = collection(db, 'quizQuits');
                         await addDoc(quitRef, {
                           userId: user.uid,
                           quizId,
                           quitTime: serverTimestamp()
                         });
                       } catch (error) {
                         console.error("Failed to record quiz quit", error);
                       }
                     }
                     router.push('/dashboard');
                   }}
                 >
                   Quit Quiz
                 </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <aside className="w-24 hidden lg:flex flex-col items-center gap-4 py-4 sticky top-24">
            <div className="bg-secondary/40 backdrop-blur-sm p-2 rounded-lg shadow-lg w-full">
              <h3 className="font-bold text-primary uppercase tracking-widest text-xs mb-2 text-center bg-primary/10 py-1 rounded-md">Perks</h3>
              <div className="space-y-3">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className={cn(
                            "h-16 w-16 rounded-lg bg-secondary/50 relative border-2 transition-all duration-300",
                            (userPerks['fifty-fifty'] ?? 0) <= 0 ? "opacity-50" : "hover:border-primary hover:scale-105 hover:shadow-lg"
                          )}
                          onClick={useFiftyFifty} 
                          disabled={isAnswered || shuffledOptions.length <= 2 || (userPerks['fifty-fifty'] ?? 0) <= 0}
                        >
                            <div className="flex flex-col items-center">
                              <HelpCircle className="w-6 h-6 mb-0.5" />
                              <span className="text-xs">50/50</span>
                            </div>
                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-background shadow-md">
                              {userPerks['fifty-fifty'] || 0}
                            </div>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-secondary/80 backdrop-blur-sm">
                        <p>Use 50/50: Removes two incorrect options</p>
                    </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className={cn(
                            "h-16 w-16 rounded-lg bg-secondary/50 relative border-2 transition-all duration-300",
                            (userPerks['skip-question'] ?? 0) <= 0 ? "opacity-50" : "hover:border-primary hover:scale-105 hover:shadow-lg"
                          )}
                          onClick={useSkipQuestion} 
                          disabled={isAnswered || (userPerks['skip-question'] ?? 0) <= 0}
                        >
                            <div className="flex flex-col items-center">
                              <SkipForward className="w-6 h-6 mb-0.5" />
                              <span className="text-xs">Skip</span>
                            </div>
                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-background shadow-md">
                              {userPerks['skip-question'] || 0}
                            </div>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-secondary/80 backdrop-blur-sm">
                        <p>Skip Question: Move to the next question without penalty</p>
                    </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className={cn(
                            "h-16 w-16 rounded-lg bg-secondary/50 relative border-2 transition-all duration-300",
                            isScoreBoosterActive ? "border-purple-400 bg-purple-400/10" : "",
                            (!isScoreBoosterActive && (userPerks['score-booster'] ?? 0) <= 0) ? "opacity-50" : "hover:border-primary hover:scale-105 hover:shadow-lg"
                          )}
                          onClick={useScoreBooster} 
                          disabled={isAnswered || isScoreBoosterActive || (userPerks['score-booster'] ?? 0) <= 0}
                        >
                            <div className="flex flex-col items-center">
                              <Zap className={cn("w-6 h-6 mb-0.5", isScoreBoosterActive && "text-purple-400")} />
                              <span className={cn("text-xs", isScoreBoosterActive && "text-purple-400")}>2x Score</span>
                            </div>
                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-background shadow-md">
                              {userPerks['score-booster'] || 0}
                            </div>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-secondary/80 backdrop-blur-sm">
                        <p>Score Booster: Doubles your score for this quiz</p>
                    </TooltipContent>
                </Tooltip>
              </div>
            </div>
        </aside>
    </div>
    </TooltipProvider>
  );
}
