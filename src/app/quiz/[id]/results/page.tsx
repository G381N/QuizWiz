'use client';

import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Home, RotateCw } from 'lucide-react';
import * as React from 'react';
import Image from 'next/image';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const score = searchParams.get('score');

  const finalScore = score ? parseInt(score, 10) : 0;
  const bonus = Math.floor(finalScore * 0.5);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md text-center shadow-2xl animate-in fade-in zoom-in-95 rounded-3xl p-6 bg-white/80 backdrop-blur-sm">
        <CardHeader className="p-0">
          <div className="relative w-48 h-24 mx-auto">
             <Star className="absolute top-0 left-0 text-yellow-400 w-12 h-12 rotate-[-15deg]" fill="currentColor" />
             <Star className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-400 w-16 h-16" fill="currentColor" />
             <Star className="absolute top-0 right-0 text-yellow-400 w-12 h-12 rotate-[15deg]" fill="currentColor" />
          </div>
          <CardTitle className="text-2xl font-bold mt-4">Congrats Orenji you won the game!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 my-8">
            <div className="bg-purple-100 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center text-lg">
                    <div className="flex items-center gap-2">
                        <Image src="/avatars/1.svg" alt="Orenji" width={40} height={40} className="rounded-full" />
                        <span>Score</span>
                    </div>
                    <span className="font-bold">{finalScore}px</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                    <div className="flex items-center gap-2">
                        <Star className="text-yellow-500 w-10 h-10" fill="currentColor" />
                        <span>Bonus</span>
                    </div>
                    <span className="font-bold">{bonus}px</span>
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button size="lg" className="w-full" onClick={() => router.push('/')}>
            Next
          </Button>
          <Button variant="link" onClick={() => router.push('/')}>
            Back to homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
