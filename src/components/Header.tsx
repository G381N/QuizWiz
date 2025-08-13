
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, Star, Store, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as React from 'react';
import { doc, getDoc, onSnapshot, writeBatch, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteUser } from 'firebase/auth';


export default function Header() {
  const { user, signOut: logOut, loading } = useAuth();
  const [totalScore, setTotalScore] = React.useState(0);
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);


  React.useEffect(() => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
             if(doc.exists()) {
                setTotalScore(doc.data().totalScore || 0);
            }
        });
        return () => unsubscribe();
    }
  }, [user]);

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
        const batch = writeBatch(db);

        // 1. Delete user's leaderboard entries from all quizzes
        const quizzesQuery = query(collection(db, 'quizzes'), where('leaderboard', 'array-contains', { userId: user.uid }));
        const quizzesSnapshot = await getDocs(quizzesQuery);
        
        quizzesSnapshot.forEach(quizDoc => {
            const quizData = quizDoc.data();
            const newLeaderboard = quizData.leaderboard.filter((entry: any) => entry.userId !== user.uid);
            batch.update(quizDoc.ref, { leaderboard: newLeaderboard });
        });

        // 2. Delete user document from 'users' collection
        const userDocRef = doc(db, 'users', user.uid);
        batch.delete(userDocRef);

        // 3. Commit batch write
        await batch.commit();
        
        // 4. Delete user from Firebase Auth
        await deleteUser(user);
        
        toast({ title: "Account Deleted", description: "Your account and all associated data have been removed." });
        router.push('/login');
        
    } catch (error) {
        console.error("Error deleting account:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete your account. Please try again.' });
    }
  };


  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
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
            <div className="hidden md:flex items-center gap-2">
               <Button variant="link" asChild className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Link href="/dashboard">Home</Link>
               </Button>
               <Button variant="link" asChild className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                   <Link href="/leaderboard">Leaderboard</Link>
               </Button>
                <Button variant="link" asChild className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                   <Link href="/store">Store</Link>
                </Button>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Image src={user.photoURL || '/avatars/1.svg'} alt={user.displayName || "User Avatar"} layout="fill" className="rounded-full" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <div className="px-2 py-1.5 text-sm flex items-center">
                        <Star className="mr-2 h-4 w-4 text-yellow-400" />
                        <span className="font-semibold">{totalScore.toLocaleString()} PTS</span>
                     </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/store')}>
                      <Store className="mr-2 h-4 w-4" />
                      <span>Perk Store</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:bg-red-500/10 focus:text-red-400">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Account</span>
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account, remove your data from our leaderboards, and log you out. Quizzes you have created will remain.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                                    Yes, delete my account
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
        </div>
      </div>
    </header>
  );
}
