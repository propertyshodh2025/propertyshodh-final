import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

interface ChatProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const ChatProgress = ({ currentStep, totalSteps, stepTitles }: ChatProgressProps) => {
  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b p-4 z-10">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Property Listing Progress</span>
          <span className="text-muted-foreground">{currentStep}/{totalSteps}</span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Currently: {stepTitles[currentStep - 1] || 'Getting started'}</span>
        </div>
      </div>
    </div>
  );
};