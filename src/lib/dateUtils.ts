import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Format a date to show both date and time
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Jan 15, 2024 at 10:30 AM")
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    
    return format(dateObj, 'MMM d, yyyy \'at\' h:mm a');
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format a date to show only the date
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    
    return format(dateObj, 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format a date to show only the time
 * @param date - Date string or Date object
 * @returns Formatted time string (e.g., "10:30 AM")
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid time';
    
    return format(dateObj, 'h:mm a');
  } catch (error) {
    return 'Invalid time';
  }
}

/**
 * Format a date to show relative time
 * @param date - Date string or Date object
 * @returns Relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format a date for display in tables with both date and time
 * @param date - Date string or Date object
 * @returns Formatted date string optimized for table display
 */
export function formatTableDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    
    return format(dateObj, 'MMM d, yyyy • h:mm a');
  } catch (error) {
    return 'Invalid date';
  }
}