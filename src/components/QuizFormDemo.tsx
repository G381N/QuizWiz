'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const QuizFormDemo = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <label className="text-sm font-medium">Topic</label>
            <Input placeholder="e.g., The Renaissance" className="bg-secondary/50 border-border" />
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select>
                <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Select a difficulty..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Button className="w-full" disabled>
            <Plus className="mr-2 h-4 w-4" />
            Generate Quiz
        </Button>
    </div>
);

export default QuizFormDemo;
