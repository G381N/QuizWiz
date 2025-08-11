export type Question = {
  question: string;
  options: string[];
  answer: string;
};

export type Quiz = {
  id: string;
  topic: string;
  difficulty: string;
  questions: Question[];
};
