import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TranslatableText } from '@/components/TranslatableText';

interface QuickReplyOption {
  id: string;
  label: React.ReactNode;
  value: any;
  description?: React.ReactNode;
}

interface QuickReplyButtonsProps {
  options: QuickReplyOption[];
  onSelect: (option: QuickReplyOption) => void;
  selectedValue?: any;
  disabled?: boolean;
  columns?: number;
}

export const QuickReplyButtons = ({ 
  options, 
  onSelect, 
  selectedValue, 
  disabled = false,
  columns = 2 
}: QuickReplyButtonsProps) => {
  return (
    <div className={cn(
      "grid gap-2 mt-2",
      columns === 2 ? "grid-cols-2" : 
      columns === 3 ? "grid-cols-3" : 
      "grid-cols-1"
    )}>
      {options.map((option) => (
        <Button
          key={option.id}
          variant={(Array.isArray(selectedValue) ? selectedValue.includes(option.value) : selectedValue === option.value) ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(option)}
          disabled={disabled}
          className={cn(
            "justify-start text-left h-auto p-3 hover:scale-105 transition-all",
            (Array.isArray(selectedValue) ? selectedValue.includes(option.value) : selectedValue === option.value) && "ring-2 ring-primary/20"
          )}
        >
          <div>
            <div className="font-medium text-sm">
              {typeof option.label === 'string' ? <TranslatableText text={option.label} /> : option.label}
            </div>
            {option.description && (
              <div className="text-xs opacity-70 mt-1">
                {typeof option.description === 'string' ? <TranslatableText text={option.description} /> : option.description}
              </div>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};