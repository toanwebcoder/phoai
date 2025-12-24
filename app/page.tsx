'use client';

import Link from 'next/link';
import { Camera, Utensils, Mic, MapPin, DollarSign, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Camera,
      title: t.features.menuScanner.title,
      description: t.features.menuScanner.description,
      details: t.features.menuScanner.details,
      href: '/scanner',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Utensils,
      title: t.features.foodRecognition.title,
      description: t.features.foodRecognition.description,
      details: t.features.foodRecognition.details,
      href: '/food-recognition',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Mic,
      title: t.features.voiceAssistant.title,
      description: t.features.voiceAssistant.description,
      details: t.features.voiceAssistant.details,
      href: '/voice-assistant',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: MapPin,
      title: t.features.smartRecommendations.title,
      description: t.features.smartRecommendations.description,
      details: t.features.smartRecommendations.details,
      href: '/recommendations',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: DollarSign,
      title: t.features.priceCheck.title,
      description: t.features.priceCheck.description,
      details: t.features.priceCheck.details,
      href: '/price-check',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 pt-16 lg:pt-20">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6">
          <Badge className="text-lg px-4 py-2" variant="secondary">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            Powered by Gemini AI
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
            {t.home.title}
          </h1>

          <p className="text-2xl md:text-3xl text-gray-700 max-w-3xl mx-auto">
            {t.home.subtitle}
          </p>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {t.home.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/scanner">
                <Camera className="mr-2 h-5 w-5" />
                {t.home.startScanning}
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link href="/recommendations">
                <MapPin className="mr-2 h-5 w-5" />
                {t.home.getRecommendations}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t.home.features}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link href={feature.href} key={feature.title}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base font-medium text-gray-700">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{feature.details}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-white rounded-lg my-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t.home.howItWorks}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-orange-600">1</span>
            </div>
            <h3 className="text-xl font-semibold">{t.home.step1Title}</h3>
            <p className="text-gray-600">{t.home.step1Desc}</p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-orange-600">2</span>
            </div>
            <h3 className="text-xl font-semibold">{t.home.step2Title}</h3>
            <p className="text-gray-600">{t.home.step2Desc}</p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-orange-600">3</span>
            </div>
            <h3 className="text-xl font-semibold">{t.home.step3Title}</h3>
            <p className="text-gray-600">{t.home.step3Desc}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-gray-600 border-t">
        <p className="mb-2">{t.home.footerText}</p>
        <p className="text-sm mb-4">{t.home.footerPowered}</p>
        <p className="text-sm">
          {t.home.madeBy}{' '}
          <a
            href="https://doxuantoan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
          >
            ToanWeb
          </a>
        </p>
      </footer>
    </div>
  );
}
