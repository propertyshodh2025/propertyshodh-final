import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  placeholder: string;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  multiline?: boolean;
  type?: 'text' | 'number' | 'email' | 'tel';
  validation?: (value: string) => string | null;
}

export const ChatInput = ({ 
  placeholder, 
  onSubmit, 
  disabled = false, 
  multiline = false,
  type = 'text',
  validation
}: ChatInputProps) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!value.trim()) return;
    
    if (validation) {
      const validationError = validation(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    
    setError(null);
    onSubmit(value.trim());
    setValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <InputComponent
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            type={type}
            className={cn(
              "resize-none transition-all duration-200",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            rows={multiline ? 3 : undefined}
          />
          {error && (
            <p className="text-sm text-destructive mt-1">{error}</p>
          )}
        </div>
        <Button 
          type="submit" 
          size="sm" 
          disabled={disabled || !value.trim()}
          className="h-10 w-10 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};