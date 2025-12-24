'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Camera, Utensils, Mic, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const menuItems = [
    {
      href: '/scanner',
      icon: Camera,
      label: t.features.menuScanner.title,
      color: 'text-blue-600',
    },
    {
      href: '/food-recognition',
      icon: Utensils,
      label: t.features.foodRecognition.title,
      color: 'text-orange-600',
    },
    {
      href: '/voice-assistant',
      icon: Mic,
      label: t.features.voiceAssistant.title,
      color: 'text-purple-600',
    },
    {
      href: '/recommendations',
      icon: MapPin,
      label: t.features.smartRecommendations.title,
      color: 'text-green-600',
    },
    {
      href: '/price-check',
      icon: DollarSign,
      label: t.features.priceCheck.title,
      color: 'text-red-600',
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="icon"
          className="bg-white shadow-lg"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Language Switcher - Always visible on mobile */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <div className="bg-white shadow-lg rounded-md p-2">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Desktop Language Switcher */}
      <div className="hidden lg:block fixed top-20 right-4 z-50">
        <div className="bg-white shadow-lg rounded-md p-2">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Logo */}
          <Link href="/" onClick={() => setIsOpen(false)}>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent mb-8 mt-12">
              Phở.AI
            </h1>
          </Link>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-6 left-6 right-6 text-sm text-gray-600 border-t pt-4">
            <p className="mb-1">{t.home.footerText}</p>
            <p className="text-xs">{t.home.footerPowered}</p>
          </div>
        </div>
      </div>
    </>
  );
}
