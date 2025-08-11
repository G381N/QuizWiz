'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { QuizCard } from '@/components/QuizCard';
import { type Quiz } from '@/types';
import { Search } from 'lucide-react';

interface QuizFeedProps {
  quizzes: Quiz[];
}

export function QuizFeed({ quizzes }: QuizFeedProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a quiz..."
          className="pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg">
          <p className="text-muted-foreground">No quizzes found. Try a different search!</p>
        </div>
      )}
    </div>
  );
}
