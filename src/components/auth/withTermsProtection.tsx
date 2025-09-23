import React from 'react';
import { useTermsValidation } from '@/hooks/useTermsValidation';
import { EnhancedMobileVerificationDialog } from './EnhancedMobileVerificationDialog';

interface WithTermsProtectionOptions {
  fallbackComponent?: React.ComponentType;
  redirectOnFailure?: boolean;
}

export function withTermsProtection<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: WithTermsProtectionOptions = {}
) {
  const { fallbackComponent: FallbackComponent, redirectOnFailure = false } = options;

  return function ProtectedComponent(props: T) {
    const { isLoading, isVerified, error, refetch } = useTermsValidation();

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Show error state
    if (error && !isVerified) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
            <h2 className="text-red-800 dark:text-red-200 font-semibold mb-2">
              Verification Error
            </h2>
            <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    // Show terms acceptance dialog if not verified
    if (isVerified === false) {
      if (redirectOnFailure) {
        window.location.href = '/';
        return null;
      }

      if (FallbackComponent) {
        return <FallbackComponent />;
      }

      return (
        <EnhancedMobileVerificationDialog
          open={true}
          onOpenChange={() => {}} // Prevent closing
          onComplete={() => {
            refetch(); // Revalidate after completion
          }}
          mandatory={true}
        />
      );
    }

    // User is verified, render the wrapped component
    return <WrappedComponent {...props} />;
  };
}

// Convenience wrapper for simpler usage
export const TermsProtectedRoute: React.FC<{
  children: React.ReactNode;
  fallback?: React.ComponentType;
  redirectOnFailure?: boolean;
}> = ({ children, fallback, redirectOnFailure }) => {
  const ProtectedComponent = withTermsProtection(
    ({ children }: { children: React.ReactNode }) => <>{children}</>,
    { fallbackComponent: fallback, redirectOnFailure }
  );

  return <ProtectedComponent>{children}</ProtectedComponent>;
};