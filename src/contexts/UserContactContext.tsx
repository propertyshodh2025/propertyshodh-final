import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContact {
  name: string;
  phone: string;
  countryCode: string;
  sessionStartTime: string;
}

interface UserContactContextType {
  userContact: UserContact | null;
  setUserContact: (contact: UserContact | null) => void;
  hasUserContact: () => boolean;
  clearUserContact: () => void;
  getFullPhoneNumber: () => string | null;
  hasShownInterest: (propertyId: string) => boolean;
  markInterestShown: (propertyId: string) => void;
}

const UserContactContext = createContext<UserContactContextType | undefined>(undefined);

interface UserContactProviderProps {
  children: ReactNode;
}

export const UserContactProvider: React.FC<UserContactProviderProps> = ({ children }) => {
  const [userContact, setUserContactState] = useState<UserContact | null>(null);
  const [submittedInterests, setSubmittedInterests] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load contact details and submitted interests from session storage on component mount
    const loadFromStorage = () => {
      try {
        const stored = sessionStorage.getItem('userContact');
        if (stored) {
          const contact = JSON.parse(stored);
          setUserContactState(contact);
        }

        const storedInterests = sessionStorage.getItem('submittedInterests');
        if (storedInterests) {
          const interests = JSON.parse(storedInterests);
          setSubmittedInterests(new Set(interests));
        }
      } catch (error) {
        console.error('Error loading user data from storage:', error);
        sessionStorage.removeItem('userContact');
        sessionStorage.removeItem('submittedInterests');
      }
    };

    loadFromStorage();
  }, []);

  const setUserContact = (contact: UserContact | null) => {
    setUserContactState(contact);
    if (contact) {
      // Store in session storage
      try {
        sessionStorage.setItem('userContact', JSON.stringify(contact));
      } catch (error) {
        console.error('Error storing user contact:', error);
      }
    } else {
      // Remove from session storage
      sessionStorage.removeItem('userContact');
    }
  };

  const hasUserContact = (): boolean => {
    return userContact !== null && Boolean(userContact.name) && Boolean(userContact.phone);
  };

  const clearUserContact = () => {
    setUserContact(null);
  };

  const getFullPhoneNumber = () => {
    if (!userContact) return null;
    return `${userContact.countryCode}${userContact.phone}`;
  };

  const hasShownInterest = (propertyId: string): boolean => {
    return submittedInterests.has(propertyId);
  };

  const markInterestShown = (propertyId: string) => {
    const newInterests = new Set(submittedInterests);
    newInterests.add(propertyId);
    setSubmittedInterests(newInterests);
    
    try {
      sessionStorage.setItem('submittedInterests', JSON.stringify(Array.from(newInterests)));
    } catch (error) {
      console.error('Error storing submitted interests:', error);
    }
  };

  const value: UserContactContextType = {
    userContact,
    setUserContact,
    hasUserContact,
    clearUserContact,
    getFullPhoneNumber,
    hasShownInterest,
    markInterestShown
  };

  return (
    <UserContactContext.Provider value={value}>
      {children}
    </UserContactContext.Provider>
  );
};

export const useUserContact = (): UserContactContextType => {
  const context = useContext(UserContactContext);
  if (!context) {
    throw new Error('useUserContact must be used within a UserContactProvider');
  }
  return context;
};