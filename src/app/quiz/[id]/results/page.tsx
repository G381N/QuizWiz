
'use client';

import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, RotateCw, Loader2 } from 'lucide-react';
import * as React from 'react';
import { type Quiz } from '@/types';
import { doc, getDoc, serverTimestamp, addDoc, collection, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { generateQuiz, type GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const allDifficulties = [
  'dumb-dumb',
  'novice',
  'beginner',
  'intermediate',
  'advanced',
  'expert',
];

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const quizId = params.id as string;
  
  const [finalScore, setFinalScore] = React.useState(0);
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [newDifficulty, setNewDifficulty] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [completedQuizKeys, setCompletedQuizKeys] = React.useState<string[]>([]);


  React.useEffect(() => {
    const fetchQuizData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const score = localStorage.getItem(`quiz_score_${quizId}`);
      if (score) {
        setFinalScore(parseInt(score, 10));
      }

      const docRef = doc(db, 'quizzes', quizId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const quizData = { id: docSnap.id, ...docSnap.data() } as Quiz;
        setQuiz(quizData);
        setNewDifficulty(quizData.difficulty);

        // Fetch completed quizzes to filter the difficulty dropdown
        const completedQuizzesCollectionRef = collection(db, 'users', user.uid, 'completedQuizzes');
        const completedSnapshot = await getDocs(completedQuizzesCollectionRef);
        const completedKeys = completedSnapshot.docs.map(doc => doc.id.split('_')[1]);
        
        // This logic seems incorrect. The keys are like 'Topic_difficulty'
        const correctCompletedKeys = completedSnapshot.docs.map(doc => doc.id);
        const topicSpecificCompletedDifficulties = correctCompletedKeys
            .filter(key => key.startsWith(`${quizData.topic}_`))
            .map(key => key.substring(quizData.topic.length + 1));
        
        setCompletedQuizKeys(topicSpecificCompletedDifficulties);

      }
      setLoading(false);
    }
    fetchQuizData();
  }, [quizId, user]);
  
  const availableDifficulties = React.useMemo(() => {
    if (!quiz) return [];
    // Only show difficulties that are not completed
    return allDifficulties.filter(d => !completedQuizKeys.includes(d));
  }, [completedQuizKeys, quiz]);


  const handlePlayNewDifficulty = async () => {
    if (!quiz || !newDifficulty || !user) return;
    
    // Final check before generating
    if(completedQuizKeys.includes(newDifficulty)) {
      toast({ variant: 'destructive', title: "Already Completed", description: "You have already completed this difficulty."});
      return;
    }
    
    setIsGenerating(true);
    
    try {
        // Check if a quiz with this topic and difficulty already exists
        const q = query(collection(db, 'quizzes'), 
            where('topic', '==', quiz.topic), 
            where('difficulty', '==', newDifficulty)
        );
        const querySnapshot = await getDocs(q);

        let targetQuizId: string;

        if (!querySnapshot.empty) {
            targetQuizId = querySnapshot.docs[0].id;
        } else {
            toast({ title: 'Generating New Quiz...', description: 'Please wait a moment.' });
            const result: GenerateQuizOutput = await generateQuiz({ topic: quiz.topic, difficulty: newDifficulty, category: quiz.category });
            
            if (result && result.quiz) {
                const newQuizData = {
                userId: user.uid,
                topic: quiz.topic,
                difficulty: newDifficulty,
                category: quiz.category,
                description: result.description,
                questions: result.quiz,
                leaderboard: [],
                createdAt: serverTimestamp(),
                };
                const docRef = await addDoc(collection(db, 'quizzes'), newQuizData);
                targetQuizId = docRef.id;
            } else {
                throw new Error('Failed to generate quiz, please try again.');
            }
        }
        localStorage.removeItem(`quiz_score_${quizId}`);
        router.push(`/quiz/${targetQuizId}`);

    } catch (error) {
       console.error('Quiz generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setIsGenerating(false);
    }
  }
  
  if (loading) {
    return (
       <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md text-center shadow-2xl animate-in fade-in zoom-in-95 rounded-2xl p-6 bg-secondary/50 border border-border">
        <CardHeader className="p-0">
           <svg
              className="w-24 h-24 mx-auto text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 z" />
              <path d="M12 2" />
            </svg>
          <CardTitle className="text-2xl font-bold mt-4">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 my-8">
            <p className="text-5xl font-extrabold text-primary tracking-tighter">{finalScore.toLocaleString()}</p>
            <p className="text-muted-foreground -mt-2">Total Score</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <div className="w-full space-y-2">
            <Select onValueChange={setNewDifficulty} defaultValue={newDifficulty ?? undefined}>
              <SelectTrigger disabled={availableDifficulties.length === 0}>
                <SelectValue placeholder="Select a new difficulty..." />
              </SelectTrigger>
              <SelectContent>
                {availableDifficulties.length > 0 ? (
                  availableDifficulties.map(d => (
                    <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No more difficulties left!</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button size="lg" className="w-full" onClick={handlePlayNewDifficulty} disabled={isGenerating || !newDifficulty || availableDifficulties.length === 0}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RotateCw className="mr-2 h-4 w-4" />}
              {isGenerating ? "Generating..." : "Try a New Difficulty"}
            </Button>
          </div>
          <Button variant="ghost" className="w-full" onClick={() => router.push('/dashboard')}>
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    