"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TranslatableText } from "@/components/TranslatableText";
import { useLanguage } from "@/contexts/LanguageContext";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  emptyMessage = "No option found.",
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useLanguage();

  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedLabel ? (
            selectedLabel
          ) : (
            <TranslatableText text={placeholder} />
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={t('search_options')} />
          <CommandEmpty><TranslatableText text={emptyMessage} /></CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto"> {/* Added max-h and overflow-y-auto */}
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label} // Use label for search matching
                onSelect={(currentLabel) => {
                  const selectedOption = options.find(o => o.label.toLowerCase() === currentLabel.toLowerCase());
                  if (selectedOption) {
                    onValueChange(selectedOption.value);
                  }
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};