import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TermsValidationDetails {
  mobile_verified: boolean;
  phone_number_provided: boolean;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  onboarding_completed: boolean;
  terms_accepted_at?: string | null;
  privacy_policy_accepted_at?: string | null;
}

interface TermsValidationResult {
  isLoading: boolean;
  isVerified: boolean | null;
  details: TermsValidationDetails | null;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTermsValidation = (): TermsValidationResult => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [details, setDetails] = useState<TermsValidationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateTerms = async () => {
    if (!user) {
      setIsVerified(null);
      setDetails(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use server-side validation to prevent client-side bypassing
      const { data, error: validationError } = await supabase.functions.invoke(
        'validate-terms-acceptance',
        {
          body: {
            action: 'validate',
            user_id: user.id,
          },
        }
      );

      if (validationError) {
        console.error('Terms validation error:', validationError);
        setError('Failed to validate terms acceptance');
        setIsVerified(false);
        return;
      }

      if (data?.success) {
        setIsVerified(data.verified);
        setDetails(data.details);
      } else {
        setError('Invalid response from validation service');
        setIsVerified(false);
      }
    } catch (err) {
      console.error('Terms validation failed:', err);
      setError('Validation service unavailable');
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateTerms();
  }, [user]);

  return {
    isLoading,
    isVerified,
    details,
    error,
    refetch: validateTerms,
  };
};