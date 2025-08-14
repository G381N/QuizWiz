
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

const difficultyQuestionCount: Record<string, number> = {
  'dumb-dumb': 5,
  'novice': 7,
  'beginner': 10,
  'intermediate': 12,
  'advanced': 15,
  'expert': 15,
  'point-farming': 20,
};

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
      'point-farming',
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
  prompt: `You are a quiz generator. Generate a multiple-choice quiz on the topic of {{{topic}}}. 
The difficulty level should be {{{difficulty}}}. 
The quiz should have a specific number of questions based on its difficulty.
The quiz should be for the category: {{{category}}}.
Also, generate a short, engaging, one-sentence description for the quiz.
The quiz should be returned as a JSON object that matches the provided schema.

Here's the schema of the object:
\n{{outputSchema}}\n`,
  config: {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
    ],
  },
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {

    const questionCount = difficultyQuestionCount[input.difficulty] || 10;
    const modifiedPrompt = `You are a quiz generator. Generate a ${questionCount}-question multiple-choice quiz on the topic of ${input.topic}. 
The difficulty level should be ${input.difficulty}. 
The quiz should be for the category: ${input.category}.
Also, generate a short, engaging, one-sentence description for the quiz.
The quiz should be returned as a JSON object that matches the provided schema.`

    const {output} = await prompt(input, {prompt: modifiedPrompt});
    return output!;
  }
);
