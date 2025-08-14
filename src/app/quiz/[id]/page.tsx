
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
import { doc, getDoc, updateDoc, runTransaction, increment, collection, query, where, getDocs, writeBatch, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { db } from '@/lib/firebase';


const DEFAULT_TIME_PER_QUESTION = 15; // seconds
const ATTACKED_TIME_PER_QUESTION = 5;
const POINTS_PER_SECOND = 10;
const STREAK_BONUS = 50;
const TIME_DANGER_THRESHOLD = 5;

const DIFFICULTY_MULTIPLIER: { [key: string]: number } = {
    'dumb-dumb': 0.2,
    'novice': 0.4,
    'beginner': 1.0,
    'intermediate': 1.2,
    'advanced': 1.5,
    'expert': 2.0,
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
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
            toast({
                title: 'You are under attack!',
                description: `${attackData.attackerName} used a Time Attack! You only have 5 seconds per question.`,
                variant: 'destructive',
                duration: 5000,
            });
            await updateDoc(doc(db, 'attacks', attackDoc.id), { used: true });
        }


        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserPerks(userData.perks || {});
             if (userData.perks?.['score-booster-active']) {
                setIsScoreBoosterActive(true);
                await updateDoc(userDocRef, { 'perks.score-booster-active': false }); // Consume it
                toast({ title: 'Score Booster Active!', description: 'Your points for this quiz will be doubled!' });
            }
        }
      } catch (error) {
        console.error("Failed to load quiz", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load quiz.' });
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
          handleAnswer(null); // Timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [currentQuestionIndex, isAnswered, quiz, isLoading, isCompleted]);

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
      const multiplier = DIFFICULTY_MULTIPLIER[quiz.difficulty] || 1;
      points = Math.round(timeLeft * POINTS_PER_SECOND * multiplier);
      const currentStreak = streak + 1;
      setStreak(currentStreak);
      if (currentStreak > 1) {
          points += STREAK_BONUS * (currentStreak - 1);
      }
      if (isScoreBoosterActive) {
          points *= 2;
      }
    } else {
        setStreak(0);
    }
    
    totalScoreRef.current += points;
    setScore(totalScoreRef.current);
    
    setTimeout(() => handleNextStep(), 2000);
  };
  
  const updateLeaderboards = async (finalScore: number) => {
    if (!user || !quiz) return;

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
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save your score.' });
    }
  };

  const useFiftyFifty = async () => {
    if (!quiz || !user || isAnswered) return;
    if (!userPerks['fifty-fifty'] || userPerks['fifty-fifty'] <= 0) {
        toast({ variant: 'destructive', title: "No 50/50 perks left!" });
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
        
        toast({ title: "50/50 Used!", description: "Two incorrect options have been removed." });

    } catch (error) {
        console.error("Failed to use 50/50 perk", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not use perk.' });
    }
  }

  const useSkipQuestion = async () => {
    if (!quiz || !user || isAnswered) return;
    if (!userPerks['skip-question'] || userPerks['skip-question'] <= 0) {
      toast({ variant: 'destructive', title: "No Skip perks left!" });
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
      toast({ title: "Question Skipped!", description: "You will not receive points for this question." });
      setTimeout(() => handleNextStep(), 1500);

    } catch (error) {
      console.error("Failed to use skip perk", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not use perk.' });
    }
  }
  
  const useScoreBooster = async () => {
    if (!user || isScoreBoosterActive) return;
    if (!userPerks['score-booster'] || userPerks['score-booster'] <= 0) {
        toast({ variant: 'destructive', title: "No Score Booster perks left!" });
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
        toast({ title: 'Score Booster Activated!', description: 'Your points for this quiz will be doubled!' });
    } catch (error) {
        console.error("Failed to use score booster perk", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not use perk.' });
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
    <div className="flex justify-center items-start gap-8">
        <div className={cn("w-full max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500 p-4 md:p-0 transition-all", isTimeDanger && 'pulse-danger rounded-2xl')}>
           <div className="flex items-center justify-between gap-4">
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsExitDialogVisible(true)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-grow text-center">
                  <h1 className="text-2xl font-bold tracking-tight">{quiz.topic}</h1>
                  <p className="text-sm text-muted-foreground">{`Question ${currentQuestionIndex + 1} of ${quiz.questions.length}`}</p>
                </div>
                <div className="w-24 text-right flex items-center justify-end gap-2 text-lg font-bold text-muted-foreground">
                    <Star className="h-5 w-5 text-yellow-400"/>
                    {score}
                </div>
            </div>
            
            <Progress value={progress} />
            
            <Card className="shadow-2xl border-none rounded-2xl bg-secondary/30">
                <CardContent className="p-4 sm:p-8">
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {streak > 1 && <div className="flex items-center gap-1 text-orange-400 font-bold animate-in fade-in-0 zoom-in-50"><Zap className="w-4 h-4"/> x{streak}</div>}
                                {activeAttack && <div className="flex items-center gap-1 text-red-500 font-bold animate-in fade-in-0"><ShieldAlert className="w-4 h-4"/> Attacked!</div>}
                                {isScoreBoosterActive && <div className="flex items-center gap-1 text-purple-400 font-bold animate-in fade-in-0"><Zap className="w-4 h-4"/> 2x Score!</div>}
                            </div>
                             <div className={cn("flex items-center justify-end gap-2 text-2xl font-bold transition-colors", isTimeDanger ? "text-red-500" : "text-primary")}>
                                <Clock className="h-7 w-7" />
                                <span>{timeLeft}s</span>
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl text-center font-bold leading-tight min-h-[100px] flex items-center justify-center">
                        {currentQuestion.question}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shuffledOptions.map((option, index) => (
                            <Button
                            key={option}
                            onClick={() => handleAnswer(option)}
                            disabled={isAnswered}
                            className={cn("h-auto p-4 text-base rounded-xl whitespace-normal justify-start transition-all duration-300 font-semibold border-2", getButtonClass(option))}
                            >
                            <div className="flex items-center w-full">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center font-bold text-sm mr-3">{String.fromCharCode(65 + index)}</div>
                                <span className="flex-grow text-left">{option}</span>
                                {isAnswered && (
                                <div className="ml-4">
                                    {option === currentQuestion.answer && <Check className="h-6 w-6 text-green-400" />}
                                    {option !== currentQuestion.answer && option === selectedAnswer && <X className="h-6 w-6 text-red-400" />}
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
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                 <Button variant="outline" onClick={() => setIsExitDialogVisible(false)}>Cancel</Button>
                 <Button variant="destructive" onClick={() => router.push('/dashboard')}>Quit Quiz</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <aside className="w-24 hidden lg:flex flex-col items-center gap-4 py-8 sticky top-24">
            <h3 className="font-bold text-muted-foreground uppercase tracking-widest text-sm">Perks</h3>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-16 w-16 rounded-full bg-secondary/30 relative" onClick={useFiftyFifty} disabled={isAnswered || shuffledOptions.length <= 2 || (userPerks['fifty-fifty'] ?? 0) <= 0}>
                        <HelpCircle className="w-8 h-8" />
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">{userPerks['fifty-fifty'] || 0}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Use 50/50: Removes two incorrect options.</p>
                </TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-16 w-16 rounded-full bg-secondary/30 relative" onClick={useSkipQuestion} disabled={isAnswered || (userPerks['skip-question'] ?? 0) <= 0}>
                        <SkipForward className="w-8 h-8" />
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">{userPerks['skip-question'] || 0}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Skip Question: Move to the next question without penalty.</p>
                </TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-16 w-16 rounded-full bg-secondary/30 relative" onClick={useScoreBooster} disabled={isAnswered || isScoreBoosterActive || (userPerks['score-booster'] ?? 0) <= 0}>
                        <Zap className={cn("w-8 h-8", isScoreBoosterActive && "text-purple-400")} />
                         <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">{userPerks['score-booster'] || 0}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Score Booster: Doubles your score for this quiz.</p>
                </TooltipContent>
            </Tooltip>
        </aside>
    </div>
    </TooltipProvider>
  );
}
