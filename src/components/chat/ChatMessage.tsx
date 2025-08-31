import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: React.ReactNode;
  isBot: boolean;
  timestamp?: Date;
  children?: React.ReactNode;
}

export const ChatMessage = ({ message, isBot, timestamp, children }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex gap-3 mb-4 animate-fade-in",
      isBot ? "justify-start" : "justify-end"
    )}>
      {isBot && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="/uploads/4403114e-88fe-4a66-adf0-361fde09a0e5.png" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">PS</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isBot ? "items-start" : "items-end"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isBot 
            ? "bg-muted text-foreground rounded-tl-sm" 
            : "bg-primary text-primary-foreground rounded-tr-sm"
        )}>
          {message}
        </div>
        
        {children && (
          <div className="mt-2 w-full">
            {children}
          </div>
        )}
        
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 px-1">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      
      {!isBot && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};