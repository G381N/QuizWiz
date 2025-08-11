'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

import { type Quiz, type Question } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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
          clearInterval(timerRef.current);
          handleAnswer(null); // Timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentQuestionIndex, isAnswered]);

  const handleAnswer = (answer: string | null) => {
    if (isAnswered) return;

    clearInterval(timerRef.current);
    setIsAnswered(true);
    setSelectedAnswer(answer);

    const currentQuestion = quiz?.questions[currentQuestionIndex];
    if (answer && currentQuestion && answer === currentQuestion.answer) {
      const points = timeLeft * POINTS_PER_SECOND;
      setScore((prev) => prev + points);
    }
    
    setTimeout(() => {
        if (currentQuestionIndex < (quiz?.questions.length ?? 0) - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setIsAnswered(false);
            setSelectedAnswer(null);
            setTimeLeft(TIME_PER_QUESTION);
        } else {
            router.push(`/quiz/${quizId}/results?score=${score + (timeLeft * POINTS_PER_SECOND * (answer === currentQuestion?.answer ? 1: 0))}`);
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
    if (!isAnswered) return 'bg-card hover:bg-accent/20';

    if (option === currentQuestion.answer) return 'bg-green-500/80 hover:bg-green-500 text-white';
    if (option === selectedAnswer) return 'bg-red-500/80 hover:bg-red-500 text-white';
    return 'bg-card opacity-60';
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-2xl border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl font-headline">{quiz.topic}</CardTitle>
            <div className="flex items-center gap-2 text-lg font-bold text-accent">
                <Clock className="h-6 w-6" />
                <span>{timeLeft}s</span>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <h2 className="text-2xl md:text-3xl text-center font-semibold">
              {currentQuestion.question}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => (
                <Button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className={cn("h-auto py-4 text-lg whitespace-normal justify-start transition-all duration-300", getButtonClass(option))}
                >
                  {isAnswered && (
                    <>
                      {option === currentQuestion.answer && <CheckCircle className="mr-3 h-6 w-6" />}
                      {option !== currentQuestion.answer && <XCircle className="mr-3 h-6 w-6" />}
                    </>
                  )}
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
