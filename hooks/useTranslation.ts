'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateToVietnamese, initTranslator } from '@/lib/translation';

/**
 * Hook to automatically translate text based on current language
 */
export function useTranslation(text: string | null | undefined): string {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(text || '');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    async function translate() {
      if (!text) {
        setTranslatedText('');
        return;
      }

      // If language is English, return original text
      if (language === 'en') {
        setTranslatedText(text);
        return;
      }

      // If language is Vietnamese, translate
      if (language === 'vi') {
        setIsTranslating(true);
        try {
          // Initialize translator
          await initTranslator();
          // Translate text
          const translated = await translateToVietnamese(text);
          setTranslatedText(translated);
        } catch (error) {
          console.error('Translation failed:', error);
          setTranslatedText(text); // Fallback to original
        } finally {
          setIsTranslating(false);
        }
      }
    }

    translate();
  }, [text, language]);

  return isTranslating ? text || '' : translatedText;
}

/**
 * Hook to translate object properties
 */
export function useObjectTranslation<T>(
  obj: T | null | undefined,
  keysToTranslate: string[]
): T | null {
  const { language } = useLanguage();
  const [translatedObj, setTranslatedObj] = useState<T | null>(obj || null);

  useEffect(() => {
    async function translate() {
      if (!obj) {
        setTranslatedObj(null);
        return;
      }

      if (language === 'en') {
        setTranslatedObj(obj);
        return;
      }

      if (language === 'vi') {
        try {
          await initTranslator();
          const result = await translateObjectRecursive(obj, keysToTranslate);
          setTranslatedObj(result);
        } catch (error) {
          console.error('Object translation failed:', error);
          setTranslatedObj(obj); // Fallback to original
        }
      }
    }

    translate();
  }, [obj, language, keysToTranslate]);

  return translatedObj;
}

async function translateObjectRecursive<T>(
  obj: T,
  keysToTranslate: string[]
): Promise<T> {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const result: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'string' && keysToTranslate.includes(key)) {
      result[key] = await translateToVietnamese(value);
    } else if (Array.isArray(value)) {
      result[key] = await Promise.all(
        value.map((item) => translateObjectRecursive(item, keysToTranslate))
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await translateObjectRecursive(value, keysToTranslate);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
