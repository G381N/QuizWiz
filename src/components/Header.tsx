
'use client';

import Link from 'next/link';
import { Bell, BookHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <BookHeart className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold">QuizWiz</span>
            </Link>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-6 w-6" />
                </Button>
                <Image src="/avatars/2.svg" alt="User Avatar" width={48} height={48} className="rounded-full" />
            </div>
        </div>
      </div>
    </header>
  );
}
