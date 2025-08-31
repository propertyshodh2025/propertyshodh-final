import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 mb-4 justify-start animate-fade-in">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src="/uploads/4403114e-88fe-4a66-adf0-361fde09a0e5.png" />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">PS</AvatarFallback>
      </Avatar>
      
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};