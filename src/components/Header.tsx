'use client';

import Link from 'next/link';
import { Settings, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-transparent sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-end">
           <Image src="/avatars/1.svg" alt="User Avatar" width={40} height={40} className="rounded-full" />
        </div>
      </div>
    </header>
  );
}
