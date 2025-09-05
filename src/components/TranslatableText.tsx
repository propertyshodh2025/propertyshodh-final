"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslatableTextProps {
  text: string;
}

const TranslatableText: React.FC<TranslatableTextProps> = ({ text }) => {
  const { t } = useLanguage();
  return <>{t(text)}</>;
};

export { TranslatableText };