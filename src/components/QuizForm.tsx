'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const quizFormSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
  difficulty: z.string({ required_error: 'Please select a difficulty.' }),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

const difficulties = [
  'dumb-dumb',
  'novice',
  'beginner',
  'intermediate',
  'advanced',
  'expert',
];

interface QuizFormProps {
  onCreateQuiz: (topic: string, difficulty: string) => Promise<boolean>;
}

export function QuizForm({ onCreateQuiz }: QuizFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      topic: '',
    },
  });

  const onSubmit = async (values: QuizFormValues) => {
    setIsLoading(true);
    const success = await onCreateQuiz(values.topic, values.difficulty);
    if (!success) {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-xl font-headline text-center">Create a New Quiz</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dinosaurs, Roman Empire..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a difficulty level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {difficulties.map((level) => (
                        <SelectItem key={level} value={level} className="capitalize">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Quiz <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
