'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const loadingFacts = [
  "Did you know? The human brain has about 86 billion neurons!",
  "Fun fact: A group of flamingos is called a 'flamboyance'",
  "The shortest war in history lasted only 38 minutes",
  "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old",
  "A day on Venus is longer than a year on Venus",
  "Octopuses have three hearts and blue blood",
  "The Great Wall of China is not visible from space with the naked eye",
  "Cows have best friends and get stressed when separated",
  "A bolt of lightning contains enough energy to toast 100,000 slices of bread",
  "Your brain uses 20% of the oxygen you breathe"
];

export function QuizLoadingAnimation() {
  const [fact, setFact] = React.useState('');
  
  React.useEffect(() => {
    // Pick a random fact
    const randomFact = loadingFacts[Math.floor(Math.random() * loadingFacts.length)];
    setFact(randomFact);
    
    // Change fact every 8 seconds
    const interval = setInterval(() => {
      const newFact = loadingFacts[Math.floor(Math.random() * loadingFacts.length)];
      setFact(newFact);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-background border-4 border-primary/30 rounded-full p-6 animate-float">
          <svg
            className="w-16 h-16 text-primary animate-spin-slow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-xl font-bold">Generating Your Quiz</h3>
        <p className="text-muted-foreground">Our AI wizards are crafting questions...</p>
      </div>
      
      <div className="bg-secondary/30 rounded-xl p-4 max-w-md border border-border animate-pulse">
        <p className="text-sm italic">{fact}</p>
      </div>
      
      <div className="w-full max-w-xs">
        <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-[progress_2.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
}
