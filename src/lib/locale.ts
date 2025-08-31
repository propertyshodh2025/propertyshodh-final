// Utility functions for locale-specific formatting

const MARATHI_DIGITS: Record<string, string> = {
  "0": "०",
  "1": "१",
  "2": "२",
  "3": "३",
  "4": "४",
  "5": "५",
  "6": "६",
  "7": "७",
  "8": "८",
  "9": "९",
};

export function toMarathiDigits(input: string | number): string {
  const str = String(input);
  return str.replace(/[0-9]/g, (d) => MARATHI_DIGITS[d] || d);
}

export function formatNumberWithLocale(value: number | string, language: 'english' | 'marathi') {
  const str = String(value);
  return language === 'marathi' ? toMarathiDigits(str) : str;
}

// Formats INR with L/Cr short units and applies Marathi digits when needed
export function formatINRShort(value: number | string, language: 'english' | 'marathi') {
  const num = typeof value === 'string' ? Number(value) : value;
  if (typeof num !== 'number' || !Number.isFinite(num)) return String(value);
  const abs = Math.abs(num);
  let formatted: string;
  if (abs >= 10000000) {
    formatted = `${(num / 10000000).toFixed(1)} Cr`;
  } else if (abs >= 100000) {
    formatted = `${(num / 100000).toFixed(1)} L`;
  } else {
    formatted = new Intl.NumberFormat('en-IN').format(num);
  }
  const withSymbol = `₹${formatted}`;
  return language === 'marathi' ? toMarathiDigits(withSymbol) : withSymbol;
}

