'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { QuizCard } from '@/components/QuizCard';
import { type Quiz } from '@/types';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuizFeedProps {
  quizzes: Quiz[];
}

export function QuizFeed({ quizzes }: QuizFeedProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [difficultyFilter, setDifficultyFilter] = React.useState('all');

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.topic.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (difficultyFilter === 'all' || quiz.difficulty === difficultyFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search quizzes..."
            className="pl-12 w-full h-12 rounded-xl bg-secondary border-border focus:bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select onValueChange={setDifficultyFilter} defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px] h-12 rounded-xl bg-secondary border-border focus:bg-background">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="dumb-dumb">Dumb-Dumb</SelectItem>
              <SelectItem value="novice">Novice</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
      </div>
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-secondary rounded-2xl">
          <p className="text-muted-foreground font-semibold">No quizzes found.</p>
          <p className="text-sm text-muted-foreground/70">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
}
