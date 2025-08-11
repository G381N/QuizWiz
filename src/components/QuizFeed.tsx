'use client';

import * as React from 'react';
import { QuizCard } from '@/components/QuizCard';
import { type Quiz } from '@/types';

interface QuizFeedProps {
  quizzes: Quiz[];
}

export function QuizFeed({ quizzes }: QuizFeedProps) {

  return (
    <div className="space-y-6">
      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-secondary rounded-2xl">
          <p className="text-muted-foreground font-semibold">No quizzes found.</p>
          <p className="text-sm text-muted-foreground/70">Try creating a new quiz.</p>
        </div>
      )}
    </div>
  );
}
