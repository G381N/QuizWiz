
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Search, Filter, ArrowDownUp } from 'lucide-react';
import { QuizCard } from '@/components/QuizCard';
import { type Quiz } from '@/types';
import { generateQuiz, type GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QuizForm } from '@/components/QuizForm';
import { useAuth } from '@/hooks/use-auth';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { quizCategories } from '@/types';

export default function DashboardPage() {
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isQuizFormOpen, setIsQuizFormOpen] = React.useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [sortOrder, setSortOrder] = React.useState('newest');

  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const allQuizzes: Quiz[] = [];
        querySnapshot.forEach((doc) => {
          allQuizzes.push({ id: doc.id, ...(doc.data() as Omit<Quiz, 'id'>) });
        });
        setQuizzes(allQuizzes);
      } catch (error) {
        console.error("Failed to fetch quizzes from Firestore", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your quizzes.',
        });
      }
      setLoading(false);
    };

    if(user) {
        fetchQuizzes();
    }
  }, [user, toast]);

  const handleCreateQuiz = async (topic: string, difficulty: string, category: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a quiz.' });
      return false;
    }
    try {
      const result: GenerateQuizOutput = await generateQuiz({ topic, difficulty, category });
      if (result && result.quiz) {
        const newQuizData = {
          userId: user.uid,
          topic,
          difficulty,
          category,
          description: result.description,
          questions: result.quiz,
          leaderboard: [],
          createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, 'quizzes'), newQuizData);
        // We can't get the serverTimestamp back immediately, so we'll just prepend and refetch on next load
        // Or we could optimistically create a client-side timestamp
        const newQuiz = { id: docRef.id, ...newQuizData, createdAt: { seconds: Date.now()/1000 } } as Quiz;


        setQuizzes([newQuiz, ...quizzes]);
        setIsQuizFormOpen(false);
        router.push(`/quiz/${newQuiz.id}`);
        return true;
      } else {
        throw new Error('Failed to generate quiz, please try again.');
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      return false;
    }
  };

  const filteredAndSortedQuizzes = React.useMemo(() => {
    return quizzes
      .filter(quiz => {
        const matchesSearch = quiz.topic.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || quiz.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOrder === 'oldest') {
          return (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0);
        }
        return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0); // newest
      });
  }, [quizzes, searchTerm, selectedCategory, sortOrder]);


  if (loading) {
      return (
          <div className="flex justify-center items-center h-[60vh]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:max-w-xs">
          <Input 
            placeholder="Search quizzes..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>{selectedCategory}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                    <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                    {quizCategories.map(cat => (
                        <DropdownMenuRadioItem key={cat} value={cat}>{cat}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <ArrowDownUp className="mr-2 h-4 w-4" />
                    Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                 <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                    <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Oldest</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isQuizFormOpen} onOpenChange={setIsQuizFormOpen}>
                <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Quiz
                </Button>
                </DialogTrigger>
                <DialogContent className="bg-background border-border">
                <DialogHeader>
                    <DialogTitle>Create a New Quiz</DialogTitle>
                    <DialogDescription>
                    What would you like to learn about today?
                    </DialogDescription>
                </DialogHeader>
                <QuizForm onCreateQuiz={handleCreateQuiz} />
                </DialogContent>
            </Dialog>
        </div>
      </div>

      {filteredAndSortedQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-secondary/30 rounded-2xl border-2 border-dashed border-border">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium">No quizzes found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters, or create a new quiz!
          </p>
          <div className="mt-6">
             <Dialog open={isQuizFormOpen} onOpenChange={setIsQuizFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background border-border">
                  <DialogHeader>
                    <DialogTitle>Create a New Quiz</DialogTitle>
                    <DialogDescription>
                      What would you like to learn about today?
                    </DialogDescription>
                  </DialogHeader>
                  <QuizForm onCreateQuiz={handleCreateQuiz} />
                </DialogContent>
              </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}
