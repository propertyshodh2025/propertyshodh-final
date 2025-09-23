"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContactContextType {
  contactNumber: string | null;
  setContactNumber: (number: string | null) => void;
}

const UserContactContext = createContext<UserContactContextType | undefined>(undefined);

export const UserContactProvider = ({ children }: { children: ReactNode }) => {
  const [contactNumber, setContactNumber] = useState<string | null>(null);

  return (
    <UserContactContext.Provider value={{ contactNumber, setContactNumber }}>
      {children}
    </UserContactContext.Provider>
  );
};

export const useUserContact = () => {
  const context = useContext(UserContactContext);
  if (context === undefined) {
    throw new Error('useUserContact must be used within a UserContactProvider');
  }
  return context;
};