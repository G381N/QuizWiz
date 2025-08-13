// src/ai/flows/generate-quiz.ts
'use server';
/**
 * @fileOverview A quiz generator AI agent.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { quizCategories } from '@/types';

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  difficulty: z
    .enum([
      'dumb-dumb',
      'novice',
      'beginner',
      'intermediate',
      'advanced',
      'expert',
    ])
    .describe('The difficulty level of the quiz.'),
    category: z.string().describe('The category for this quiz.')
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  description: z.string().describe('A short, engaging, one-sentence description of the quiz topic.'),
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The multiple choice options.'),
      answer: z.string().describe('The correct answer to the question.'),
    })
  ).describe('The generated quiz questions, options and answers'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are a quiz generator. Generate a 10-question multiple-choice quiz on the topic of {{{topic}}}. 
The difficulty level should be {{{difficulty}}}. 
The quiz should be for the category: {{{category}}}.
Also, generate a short, engaging, one-sentence description for the quiz.
The quiz should be returned as a JSON object that matches the provided schema.

Here's the schema of the object:
\n{{outputSchema}}\n`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
