'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-600" />
      <div className="flex rounded-md border overflow-hidden">
        <Button
          variant={language === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('en')}
          className="rounded-none text-xs px-3"
        >
          EN
        </Button>
        <Button
          variant={language === 'vi' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('vi')}
          className="rounded-none text-xs px-3"
        >
          VI
        </Button>
      </div>
    </div>
  );
}
