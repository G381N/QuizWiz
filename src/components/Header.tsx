'use client';

import Link from 'next/link';
import { Settings, UserCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
            <div>
              <p className="text-muted-foreground">Hello,</p>
              <p className="font-bold text-lg">Orenji Tomomi</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-6 w-6" />
                </Button>
                <Image src="/avatars/1.svg" alt="User Avatar" width={48} height={48} className="rounded-full" />
            </div>
        </div>
      </div>
    </header>
  );
}
