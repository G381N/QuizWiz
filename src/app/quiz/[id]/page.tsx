'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, X, Clock, Loader2, ArrowLeft } from 'lucide-react';

import { type Quiz, type Question } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
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
            router.push(`/quiz/${quizId}/results?score=${score + points}`);
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
    if (!isAnswered) return 'bg-white hover:bg-purple-100 border-purple-200 border-2 text-purple-800';

    const isCorrect = option === currentQuestion.answer;
    const isSelected = option === selectedAnswer;

    if(isCorrect) return 'bg-green-500 hover:bg-green-500 text-white border-green-700 border-2 animate-in zoom-in-105';
    if(isSelected) return 'bg-red-500 hover:bg-red-500 text-white border-red-700 border-2';
    
    return 'bg-white opacity-60';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setIsExitDialogVisible(true)}>
                <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="text-lg font-bold">
                {currentQuestionIndex + 1} / {quiz.questions.length}
            </div>
            <div className="flex items-center gap-2 text-lg font-bold text-primary">
                <Clock className="h-6 w-6" />
                <span>{timeLeft}s</span>
            </div>
        </div>
        <Progress value={progress} className="w-full h-3" />
        
        <Card className="shadow-2xl border-none rounded-3xl bg-transparent">
        <CardContent className="pt-6">
          <div className="space-y-8">
            <h2 className="text-2xl md:text-4xl text-center font-bold">
              {currentQuestion.question}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => (
                <Button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className={cn("h-auto py-6 text-lg rounded-2xl whitespace-normal justify-start transition-all duration-300 font-semibold", getButtonClass(option))}
                >
                  {isAnswered && (
                    <>
                      {option === currentQuestion.answer && <Check className="mr-3 h-6 w-6" />}
                      {option !== currentQuestion.answer && option === selectedAnswer && <X className="mr-3 h-6 w-6" />}
                    </>
                  )}
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={isExitDialogVisible} onOpenChange={setIsExitDialogVisible}>
        <AlertDialogContent>
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
