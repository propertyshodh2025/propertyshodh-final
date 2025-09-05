import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCachedTranslation, translateAndCache } from "@/lib/translator";
import { getStaticTranslation } from "@/lib/staticTranslations";

interface TranslatableTextProps {
  text: string;
  context?: string;
  // If true, when cache-miss occurs we will invoke the edge function once and cache it
  fallbackToEdge?: boolean;
}

// Track in-flight translations to avoid duplicate invokes for the same text+lang+context
const inflight = new Map<string, Promise<string>>();

export const TranslatableText: React.FC<TranslatableTextProps> = ({ text, context, fallbackToEdge = true }) => {
  const { language } = useLanguage();
  const [value, setValue] = useState(text);
  const attemptedRef = useRef(false);

  useEffect(() => {
    let canceled = false;
    attemptedRef.current = false;

    const run = async () => {
      if (language === "marathi") {
        // 1) Try cache first
        const cached = await getCachedTranslation(text, "mr", context);
        if (canceled) return;
        if (cached) {
          setValue(cached);
          return;
        }
        // 2) Local static fallback (handles common UI phrases and patterns)
        const local = getStaticTranslation(text, "marathi", context);
        if (local) {
          setValue(local);
          return;
        }
        // 3) Optional fallback to edge translate-and-cache once
        if (fallbackToEdge && !attemptedRef.current) {
          attemptedRef.current = true;
          const key = `${text}|mr|${context || "_"}`;
          let promise = inflight.get(key);
          if (!promise) {
            promise = translateAndCache(text, { target_lang: "mr", context });
            inflight.set(key, promise);
          }
          try {
            const translated = await promise;
            if (!canceled) setValue(translated || text);
          } finally {
            // Clear inflight after resolve to allow re-requests if needed later
            inflight.delete(key);
          }
        } else {
          setValue(text);
        }
      } else {
        setValue(text);
      }
    };

    run();
    return () => {
      let _ = canceled; // silence unused var if optimized
      canceled = true;
    };
  }, [text, language, context, fallbackToEdge]);

  return <>{value}</>;
};

export default TranslatableText;

