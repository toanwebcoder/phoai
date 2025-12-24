// Chrome Translation API helper
// Reference: https://developer.chrome.com/docs/ai/translator-api

interface TranslationAPI {
  createTranslator(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<Translator>;
  canTranslate(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<'readily' | 'after-download' | 'no'>;
}

interface Translator {
  translate(text: string): Promise<string>;
}

declare global {
  interface Window {
    translation?: TranslationAPI;
  }
}

let translator: Translator | null = null;
let isInitializing = false;

/**
 * Initialize Chrome Translation API
 * Checks if browser supports the API and creates a translator
 */
export async function initTranslator(): Promise<boolean> {
  // Check if Translation API is available
  if (!('translation' in window)) {
    console.warn('Chrome Translation API not available. Please use Chrome 130+ with enabled flags.');
    return false;
  }

  if (translator) {
    return true;
  }

  if (isInitializing) {
    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return translator !== null;
  }

  try {
    isInitializing = true;

    // Check if translation is available
    const canTranslate = await window.translation!.canTranslate({
      sourceLanguage: 'en',
      targetLanguage: 'vi',
    });

    if (canTranslate === 'no') {
      console.warn('Translation from English to Vietnamese is not available');
      return false;
    }

    if (canTranslate === 'after-download') {
      console.log('Downloading translation model...');
    }

    // Create translator
    translator = await window.translation!.createTranslator({
      sourceLanguage: 'en',
      targetLanguage: 'vi',
    });

    console.log('Chrome Translation API initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Chrome Translation API:', error);
    return false;
  } finally {
    isInitializing = false;
  }
}

/**
 * Translate text from English to Vietnamese using Chrome Translation API
 * Falls back to original text if translation fails or API not available
 */
export async function translateToVietnamese(text: string): Promise<string> {
  // Return original if empty
  if (!text || text.trim() === '') {
    return text;
  }

  try {
    // Initialize if needed
    if (!translator) {
      const initialized = await initTranslator();
      if (!initialized) {
        return text; // Return original text if API not available
      }
    }

    // Translate
    const translated = await translator!.translate(text);
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}

/**
 * Translate object properties recursively
 * Useful for translating JSON responses from AI
 */
export async function translateObject<T>(
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
      // Translate string values
      result[key] = await translateToVietnamese(value);
    } else if (typeof value === 'object' && value !== null) {
      // Recursively translate nested objects
      result[key] = await translateObject(value, keysToTranslate);
    } else {
      // Keep other values as-is
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Check if Chrome Translation API is supported
 */
export function isTranslationSupported(): boolean {
  return 'translation' in window;
}

/**
 * Get setup instructions for Chrome Translation API
 */
export function getTranslationSetupInstructions(): string {
  return `
To enable Chrome Translation API:
1. Use Chrome 130+ (Chrome Canary recommended)
2. Open chrome://flags
3. Enable these flags:
   - "Translator API"
   - "Optimization Guide On Device Model"
4. Restart Chrome
5. Visit chrome://components
6. Find "Translate" component and click "Check for update"
  `.trim();
}
