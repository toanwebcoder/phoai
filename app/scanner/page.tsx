'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Flame, History } from 'lucide-react';
import Camera from '@/components/features/Camera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analyzeMenuImage } from '@/lib/gemini';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateToVietnamese } from '@/lib/translation';
import { useHistory } from '@/hooks/useHistory';
import HistoryModal from '@/components/HistoryModal';
import { HistoryItem } from '@/lib/history';

interface Dish {
  name: string;
  vietnameseName?: string;
  description: string;
  spicyLevel: string;
  allergens: string[];
  howToEat: string;
  price?: string;
}

interface TranslatedDish extends Dish {
  translatedDescription?: string;
  translatedHowToEat?: string;
  translatedAllergens?: string[];
}

export default function MenuScanner() {
  const { t, language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [translatedDishes, setTranslatedDishes] = useState<TranslatedDish[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { addToHistory } = useHistory('scanner');

  const handleCapture = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setError(null);
    setDishes([]);
    setTranslatedDishes([]);
    setCurrentImage(imageBase64);

    try {
      const result = await analyzeMenuImage(imageBase64);
      setDishes(result.dishes || []);

      // Save to history after successful analysis
      if (result.dishes && result.dishes.length > 0) {
        addToHistory(imageBase64, result);
      }
    } catch (err) {
      console.error('Error analyzing menu:', err);
      setError(t.scanner.error || 'Cannot analyze menu. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentImage(item.image);
    setDishes(item.result.dishes || []);
    setError(null);
  };

  // Auto-translate when language changes to Vietnamese
  useEffect(() => {
    async function translateDishes() {
      if (language === 'vi' && dishes.length > 0) {
        setIsTranslating(true);
        try {
          const translated = await Promise.all(
            dishes.map(async (dish) => ({
              ...dish,
              translatedDescription: await translateToVietnamese(dish.description),
              translatedHowToEat: await translateToVietnamese(dish.howToEat),
              translatedAllergens: await Promise.all(
                dish.allergens.map((a) => translateToVietnamese(a))
              ),
            }))
          );
          setTranslatedDishes(translated);
        } catch (err) {
          console.error('Translation error:', err);
          setTranslatedDishes(dishes);
        } finally {
          setIsTranslating(false);
        }
      } else {
        setTranslatedDishes(dishes);
      }
    }

    translateDishes();
  }, [language, dishes]);

  const getSpicyLevelColor = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel === 'none') return 'bg-green-100 text-green-800';
    if (lowerLevel === 'mild') return 'bg-yellow-100 text-yellow-800';
    if (lowerLevel === 'medium') return 'bg-orange-100 text-orange-800';
    if (lowerLevel === 'hot' || lowerLevel === 'very hot') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSpicyLevelText = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (language === 'vi') {
      if (lowerLevel === 'none') return t.scanner.none;
      if (lowerLevel === 'mild') return t.scanner.mild;
      if (lowerLevel === 'medium') return t.scanner.medium;
      if (lowerLevel === 'hot') return t.scanner.hot;
      if (lowerLevel === 'very hot') return t.scanner.veryHot;
    }
    return level;
  };

  const displayDishes = language === 'vi' && translatedDishes.length > 0 ? translatedDishes : dishes;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 pt-16 lg:pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backToHome}
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsHistoryOpen(true)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            {language === 'vi' ? 'Lịch sử' : 'History'}
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{t.scanner.title}</h1>
          <p className="text-gray-600">{t.scanner.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Camera onCapture={handleCapture} isLoading={isAnalyzing} />
            {isAnalyzing && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">{t.scanner.analyzing}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-800">{error}</p>
                </CardContent>
              </Card>
            )}

            {isTranslating && language === 'vi' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-blue-800 text-sm">Đang dịch sang tiếng Việt...</p>
                </CardContent>
              </Card>
            )}

            {displayDishes.length > 0 && (
              <>
                <h2 className="text-2xl font-semibold">
                  {t.scanner.results} ({displayDishes.length} {t.scanner.dishes})
                </h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {displayDishes.map((dish, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-1">
                              {dish.name}
                            </CardTitle>
                            {dish.vietnameseName && language === 'en' && (
                              <CardDescription className="text-base">
                                {dish.vietnameseName}
                              </CardDescription>
                            )}
                          </div>
                          {dish.price && (
                            <Badge variant="secondary" className="ml-2">
                              {dish.price}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-700">
                          {language === 'vi' && 'translatedDescription' in dish && dish.translatedDescription
                            ? String(dish.translatedDescription)
                            : dish.description}
                        </p>

                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4" />
                          <Badge className={getSpicyLevelColor(dish.spicyLevel)}>
                            {getSpicyLevelText(dish.spicyLevel)}
                          </Badge>
                        </div>

                        {dish.allergens && dish.allergens.length > 0 && (
                          <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-md">
                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-amber-900">
                                {t.scanner.allergyWarning}
                              </p>
                              <p className="text-sm text-amber-800">
                                {language === 'vi' && 'translatedAllergens' in dish && Array.isArray(dish.translatedAllergens)
                                  ? dish.translatedAllergens.join(', ')
                                  : dish.allergens.join(', ')}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {t.scanner.howToEat}
                          </p>
                          <p className="text-sm text-gray-600">
                            {language === 'vi' && 'translatedHowToEat' in dish && dish.translatedHowToEat
                              ? String(dish.translatedHowToEat)
                              : dish.howToEat}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {displayDishes.length === 0 && !isAnalyzing && !error && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-gray-500">
                  <p>{t.scanner.noResults}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <HistoryModal
          type="scanner"
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectItem={handleSelectHistoryItem}
        />
      </div>
    </div>
  );
}
