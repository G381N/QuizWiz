
'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, runTransaction, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star, HelpCircle, Zap, ShieldAlert } from 'lucide-react';
import { type Perk, type UserProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const availablePerks: Perk[] = [
    { id: 'fifty-fifty', name: '50/50', description: 'Eliminates two incorrect options on a question.', cost: 500, icon: HelpCircle },
    { id: 'score-booster', name: 'Score Booster', description: 'Doubles your score for one full quiz.', cost: 1500, icon: Zap },
    { id: 'time-attack', name: 'Time Attack', description: 'Reduces an opponent\'s question time by 5 seconds.', cost: 1000, icon: ShieldAlert },
];

export default function StorePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [userData, setUserData] = React.useState<UserProfile | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isPurchasing, setIsPurchasing] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserData(userDoc.data() as UserProfile);
                }
            } catch (error) {
                console.error("Failed to fetch user data", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load your profile.' });
            }
            setLoading(false);
        };
        fetchUserData();
    }, [user, toast]);

    const handlePurchase = async (perk: Perk) => {
        if (!user || !userData) return;
        if (userData.totalScore < perk.cost) {
            toast({ variant: 'destructive', title: "Not enough points!", description: "Play more quizzes to earn points." });
            return;
        }

        setIsPurchasing(perk.id);
        const userDocRef = doc(db, 'users', user.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists() || userDoc.data().totalScore < perk.cost) {
                    throw new Error("You don't have enough points.");
                }

                transaction.update(userDocRef, {
                    totalScore: increment(-perk.cost),
                    [`perks.${perk.id}`]: increment(1),
                });
            });
            
            setUserData(prev => prev ? ({
                ...prev,
                totalScore: prev.totalScore - perk.cost,
                perks: {
                    ...prev.perks,
                    [perk.id]: ((prev.perks?.[perk.id] || 0) + 1)
                }
            }) : null);

            toast({ title: "Purchase Successful!", description: `You bought a ${perk.name} perk.` });

        } catch (error) {
            console.error("Purchase failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: 'destructive', title: "Purchase Failed", description: errorMessage });
        } finally {
            setIsPurchasing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }
    
    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            <div className="space-y-2">
                 <h1 className="text-3xl font-bold tracking-tight">Perk Store</h1>
                 <p className="text-muted-foreground">Use your points to get an edge in the competition!</p>
            </div>

            <Card className="bg-secondary/30">
                 <CardContent className="p-4 flex items-center justify-between">
                    <p className="font-semibold text-lg">Your Points Balance:</p>
                    <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                        <Star className="w-6 h-6 text-yellow-400" />
                        <span>{userData?.totalScore.toLocaleString() || 0}</span>
                    </div>
                 </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePerks.map((perk) => (
                    <Card key={perk.id} className="flex flex-col bg-secondary/50 border-border hover:border-primary/50 transition-colors duration-300 rounded-2xl">
                        <CardHeader className="items-center text-center">
                            <perk.icon className="w-12 h-12 text-primary mb-2" />
                            <CardTitle>{perk.name}</CardTitle>
                            <CardDescription className="text-balance">{perk.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow text-center">
                           <p className="text-sm text-muted-foreground">You own: <span className="font-bold text-foreground">{userData?.perks?.[perk.id] || 0}</span></p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={() => handlePurchase(perk)}
                                disabled={isPurchasing === perk.id || (userData?.totalScore ?? 0) < perk.cost}
                            >
                                {isPurchasing === perk.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Star className="mr-2 h-4 w-4" />
                                        Buy for {perk.cost.toLocaleString()}
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
