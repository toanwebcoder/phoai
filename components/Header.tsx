'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Linkedin, Utensils, Camera, UtensilsCrossed, Mic, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      href: '/scanner',
      label: t.features.menuScanner.title,
      icon: Camera,
    },
    {
      href: '/food-recognition',
      label: t.features.foodRecognition.title,
      icon: UtensilsCrossed,
    },
    {
      href: '/voice-assistant',
      label: t.features.voiceAssistant.title,
      icon: Mic,
    },
    {
      href: '/recommendations',
      label: t.features.smartRecommendations.title,
      icon: MapPin,
    },
    {
      href: '/price-check',
      label: t.features.priceCheck.title,
      icon: DollarSign,
    },
  ];

  return (
    <header className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                PHO AI
              </span>
              <span className="text-xs text-gray-500">Vietnamese Food Helper</span>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 hover:bg-gray-100"
            >
              <a
                href="https://github.com/toanwebcoder"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span className="hidden xl:inline text-sm">GitHub</span>
              </a>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 hover:bg-blue-50"
            >
              <a
                href="https://www.linkedin.com/in/toanweb/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-4 w-4 text-blue-600" />
                <span className="hidden xl:inline text-sm">LinkedIn</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
