
import type { Timestamp } from "firebase/firestore";

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
};

export type OverallLeaderboardEntry = {
    rank: number;
    name: string;
    quizzesSolved: number;
    avatar: string;
    totalScore: number;
}

export type UserProfile = {
    displayName: string;
    photoURL: string;
    quizzesSolved: number;
    totalScore: number;
}
