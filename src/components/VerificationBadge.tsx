import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  score,
  size = 'md',
  showScore = false,
  className
}) => {
  const getBadgeContent = () => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          text: 'Verified',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
        };
      case 'rejected':
        return {
          icon: X,
          text: 'Rejected',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
        };
      case 'unverified':
      default:
        return {
          icon: AlertCircle,
          text: 'Unverified',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100'
        };
    }
  };

  const { icon: Icon, text, className: badgeClassName } = getBadgeContent();

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Badge
      className={cn(
        'flex items-center gap-1 font-medium',
        sizeClasses[size],
        badgeClassName,
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {text}
      {showScore && score !== undefined && (
        <span className="ml-1 text-xs opacity-75">
          ({score}%)
        </span>
      )}
    </Badge>
  );
};

export default VerificationBadge;