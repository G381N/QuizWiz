
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2, HelpCircle } from 'lucide-react';

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
import { quizCategories as defaultCategories } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const quizFormSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
  difficulty: z.string({ required_error: 'Please select a difficulty.' }),
  category: z.string({ required_error: 'Please select a category.' }),
  otherCategory: z.string().optional(),
})
.refine(data => {
    if (data.category === 'Other') {
        return !!data.otherCategory && data.otherCategory.length > 0;
    }
    return true;
}, {
    message: 'Please specify your custom category.',
    path: ['otherCategory'],
});


type QuizFormValues = z.infer<typeof quizFormSchema>;

const difficulties = [
  'dumb-dumb',
  'novice',
  'beginner',
  'intermediate',
  'advanced',
  'expert',
  'point-farming',
];

const difficultyDescriptions: Record<string, string> = {
  'dumb-dumb': 'Very easy questions for casual fun (0.5x points)',
  'novice': 'Simple questions for beginners (0.8x points)',
  'beginner': 'Standard difficulty level (1.0x points)',
  'intermediate': 'Moderately challenging questions (1.5x points)',
  'advanced': 'Difficult questions for knowledgeable players (2.0x points)',
  'expert': 'Very challenging questions for topic experts (3.0x points)',
  'point-farming': 'Maximum difficulty for maximum rewards (4.0x points)',
};

interface QuizFormProps {
  onCreateQuiz: (topic: string, difficulty: string, category: string) => Promise<boolean>;
  categories: string[];
}

export function QuizForm({ onCreateQuiz, categories = defaultCategories }: QuizFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      topic: '',
    },
  });

  const categoryValue = form.watch('category');

  const onSubmit = async (values: QuizFormValues) => {
    setIsLoading(true);
    const finalCategory = values.category === 'Other' ? values.otherCategory || 'General Knowledge' : values.category;
    const success = await onCreateQuiz(values.topic, values.difficulty, finalCategory);
    if (!success) {
      setIsLoading(false);
    }
  };

  return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Renaissance" {...field} className="rounded-xl h-12 bg-secondary/50 border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Category</FormLabel>
                  <Select onValueChange={(value) => {
                      field.onChange(value);
                      if (value !== 'Other') {
                          form.setValue('otherCategory', '');
                          form.clearErrors('otherCategory');
                      }
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-border">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {[...categories, 'Other'].map((cat) => (
                          <SelectItem key={cat} value={cat} className="capitalize">
                            {cat}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             {categoryValue === 'Other' && (
              <FormField
                control={form.control}
                name="otherCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Custom Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pokémon" {...field} className="rounded-xl h-12 bg-secondary/50 border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="font-semibold">Difficulty</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Higher difficulties give higher point multipliers</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-border">
                        <SelectValue placeholder="Select a difficulty level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {difficulties.map((level) => (
                        <TooltipProvider key={level}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SelectItem value={level} className="capitalize">
                                {level}
                              </SelectItem>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="start">
                              <p className="text-sm max-w-60">{difficultyDescriptions[level]}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
              className="w-full"
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
  );
}
