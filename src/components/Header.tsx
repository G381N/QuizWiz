
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
                 <svg
                    className="w-8 h-8 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                <span className="text-xl font-bold tracking-tight">QuizWiz</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
               <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
               <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Leaderboard</Link>
            </div>
            <div className="flex items-center gap-2">
                <Image src="/avatars/1.svg" alt="User Avatar" width={32} height={32} className="rounded-full" />
            </div>
        </div>
      </div>
    </header>
  );
}
