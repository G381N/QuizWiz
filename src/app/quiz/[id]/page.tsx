
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, X, Clock, Loader2, ArrowLeft, ShieldCheck, Zap, Star, HelpCircle, SkipForward } from 'lucide-react';
import { type Quiz, type UserPerks } from '@/types';
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
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, runTransaction, increment, collection, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const TIME_PER_QUESTION = 15; // seconds
const POINTS_PER_SECOND = 10;
const STREAK_BONUS = 50;
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
  const [timeLeft, setTimeLeft] = React.useState(TIME_PER_QUESTION);
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [isExitDialogVisible, setIsExitDialogVisible] = React.useState(false);
  const [streak, setStreak] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [userPerks, setUserPerks] = React.useState<UserPerks>({});
  const [shuffledOptions, setShuffledOptions] = React.useState<string[]>([]);

  const timerRef = React.useRef<NodeJS.Timeout>();
  const totalScoreRef = React.useRef(0);

  React.useEffect(() => {
    const fetchQuizAndUserData = async () => {
      if (!quizId || !user) return;
      setIsLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Check if user has already completed this quiz
        const completedDocRef = doc(userDocRef, 'completedQuizzes', quizId);
        const [completedDocSnap, userDocSnap] = await Promise.all([
          getDoc(completedDocRef),
          getDoc(userDocRef)
        ]);

        if (completedDocSnap.exists()) {
            setIsCompleted(true);
            setIsLoading(false);
            return;
        }

        if (userDocSnap.exists()) {
            setUserPerks(userDocSnap.data().perks || {});
        }

        // Fetch quiz data
        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const quizData = { id: docSnap.id, ...docSnap.data() } as Quiz;
          if (!quizData.leaderboard) {
            quizData.leaderboard = [];
          }
          setQuiz(quizData);
        } else {
          router.push('/dashboard');
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
      setShuffledOptions(currentQuestion.options);
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

  const handleNextStep = () => {
      if (currentQuestionIndex < (quiz?.questions.length ?? 0) - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setIsAnswered(false);
        setSelectedAnswer(null);
        setTimeLeft(TIME_PER_QUESTION);
      } else {
        if (user) {
          updateLeaderboards(totalScoreRef.current);
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
        const completedQuizDocRef = doc(userDocRef, 'completedQuizzes', quizId);
        
        const quizDoc = await transaction.get(quizDocRef);
        
        if (!quizDoc.exists()) throw "Quiz does not exist!";

        // Mark quiz as completed for the user
        transaction.set(completedQuizDocRef, { completedAt: new Date(), score: finalScore });

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
        setShuffledOptions(currentQuestion.options.filter(opt => optionsToKeep.includes(opt)));
        
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
            <Button onClick={() => router.push('/dashboard')} className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
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
        
        <div className="relative h-2 w-full bg-secondary rounded-full">
            <div className="absolute top-0 left-0 h-2 bg-primary rounded-full" style={{width: `${progress}%`, transition: 'width 0.5s ease-in-out'}}></div>
        </div>
        <Card className="shadow-2xl border-none rounded-2xl bg-transparent">
            <CardContent className="pt-6">
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {streak > 1 && <div className="flex items-center gap-1 text-orange-400 font-bold animate-in fade-in-0 zoom-in-50"><Zap className="w-4 h-4"/> x{streak}</div>}
                        </div>
                         <div className="flex items-center justify-end gap-2 text-lg font-bold text-primary">
                            <Clock className="h-6 w-6" />
                            <span>{timeLeft}s</span>
                        </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl text-center font-bold leading-tight">
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
        <div className="flex justify-center gap-2">
           {userPerks['fifty-fifty'] && userPerks['fifty-fifty'] > 0 ? (
                <Button variant="outline" onClick={useFiftyFifty} disabled={isAnswered || shuffledOptions.length <= 2}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Use 50/50 ({userPerks['fifty-fifty']} left)
                </Button>
            ) : null}
             {userPerks['skip-question'] && userPerks['skip-question'] > 0 ? (
                <Button variant="outline" onClick={useSkipQuestion} disabled={isAnswered}>
                    <SkipForward className="mr-2 h-4 w-4" />
                    Skip Question ({userPerks['skip-question']} left)
                </Button>
            ) : null}
        </div>

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
  );
}
