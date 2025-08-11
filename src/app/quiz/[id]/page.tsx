'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, X, Clock, Loader2, ArrowLeft, ShieldQuestion } from 'lucide-react';

import { type Quiz, type Question } from '@/types';
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

const TIME_PER_QUESTION = 15; // seconds
const POINTS_PER_SECOND = 10;

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(TIME_PER_QUESTION);
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [isExitDialogVisible, setIsExitDialogVisible] = React.useState(false);

  const timerRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    try {
      const storedQuizzes = localStorage.getItem('quizzes');
      if (storedQuizzes) {
        const quizzes: Quiz[] = JSON.parse(storedQuizzes);
        const currentQuiz = quizzes.find((q) => q.id === quizId);
        if (currentQuiz) {
          setQuiz(currentQuiz);
        } else {
          router.push('/');
        }
      }
    } catch (error) {
        console.error("Failed to load quiz", error);
        router.push('/');
    }
  }, [quizId, router]);

  React.useEffect(() => {
    if (isAnswered) return;
    
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
  }, [currentQuestionIndex, isAnswered]);

  const handleAnswer = (answer: string | null) => {
    if (isAnswered) return;

    clearInterval(timerRef.current!);
    setIsAnswered(true);
    setSelectedAnswer(answer);

    const currentQuestion = quiz?.questions[currentQuestionIndex];
    let points = 0;
    if (answer && currentQuestion && answer === currentQuestion.answer) {
      points = timeLeft * POINTS_PER_SECOND;
      setScore((prev) => prev + points);
    }
    
    setTimeout(() => {
        if (currentQuestionIndex < (quiz?.questions.length ?? 0) - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setIsAnswered(false);
            setSelectedAnswer(null);
            setTimeLeft(TIME_PER_QUESTION);
        } else {
            // Save final score before navigating
            const finalScore = score + points;
            localStorage.setItem(`quiz_score_${quizId}`, finalScore.toString());
            router.push(`/quiz/${quizId}/results`);
        }
    }, 2000);
  };

  if (!quiz) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
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
            <div className="flex items-center justify-end gap-2 text-lg font-bold text-primary w-20">
                <Clock className="h-6 w-6" />
                <span>{timeLeft}s</span>
            </div>
        </div>
        <Progress value={progress} className="w-full h-2" />
        
        <Card className="shadow-2xl border-none rounded-2xl bg-transparent">
        <CardContent className="pt-6">
          <div className="space-y-8">
            <h2 className="text-2xl md:text-3xl text-center font-bold leading-tight">
              {currentQuestion.question}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
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
             <Button variant="destructive" onClick={() => router.push('/')}>Quit Quiz</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
