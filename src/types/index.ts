
import type { Timestamp } from "firebase/firestore";

export const quizCategories = [
    'Technology',
    'Science',
    'History',
    'Geography',
    'Art',
    'Music',
    'Movies',
    'Literature',
    'General Knowledge',
    'Food & Drink',
    'Sports',
    'Mythology',
];

export type Question = {
  question: string;
  options: string[];
  answer: string;
};

export type QuizLeaderboardEntry = {
    rank: number;
    name: string;
    score: number;
    avatar: string;
    userId: string;
}

export type Quiz = {
  id: string;
  userId: string;
  topic: string;
  difficulty: string;
  category: string;
  description: string;
  questions: Question[];
  leaderboard: QuizLeaderboardEntry[];
  createdAt: Timestamp | { seconds: number };
  completions?: number;
};

export type OverallLeaderboardEntry = {
    id: string;
    rank: number;
    name: string;
    quizzesSolved: number;
    avatar: string;
    totalScore: number;
}

export type UserProfile = {
    uid: string;
    displayName: string;
    photoURL: string;
    quizzesSolved: number;
    totalScore: number;
    perks?: UserPerks;
}

export type Perk = {
    id: 'fifty-fifty' | 'score-booster' | 'time-attack' | 'skip-question';
    name: string;
    description: string;
    cost: number;
    icon: React.ComponentType<{ className?: string }>;
}

export type UserPerks = {
    'fifty-fifty'?: number;
    'score-booster'?: number;
    'time-attack'?: number;
    'skip-question'?: number;
}

export type Attack = {
    id?: string;
    attackerId: string;
    attackerName: string;
    targetId: string;
    targetName: string;
    createdAt: Timestamp;
    used: boolean;
}
    