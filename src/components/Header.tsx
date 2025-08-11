
'use client';

import Link from 'next/link';
import { Bell, Search, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <ShieldQuestion className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold tracking-tight">QuizWiz</span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
               <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
               <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Leaderboard</Link>
               <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Categories</Link>
               <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                </Button>
                <Image src="/avatars/1.svg" alt="User Avatar" width={40} height={40} className="rounded-full border-2 border-primary/50" />
            </div>
        </div>
      </div>
    </header>
  );
}
