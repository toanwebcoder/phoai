'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Utensils, Sparkles, DollarSign, History } from 'lucide-react';
import Camera from '@/components/features/Camera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analyzeFoodImage } from '@/lib/gemini';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateToVietnamese } from '@/lib/translation';
import { useHistory } from '@/hooks/useHistory';
import HistoryModal from '@/components/HistoryModal';
import { HistoryItem } from '@/lib/history';

interface FoodInfo {
  dishName: string;
  vietnameseName?: string;
  origin: string;
  description: string;
  ingredients: string[];
  howToEat: string;
  culturalSignificance: string;
  estimatedPrice: {
    min: number;
    max: number;
    currency: string;
  };
}

interface TranslatedFoodInfo extends FoodInfo {
  translatedOrigin?: string;
  translatedDescription?: string;
  translatedIngredients?: string[];
  translatedHowToEat?: string;
  translatedCulturalSignificance?: string;
}

export default function FoodRecognition() {
  const { t, language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [foodInfo, setFoodInfo] = useState<FoodInfo | null>(null);
  const [translatedInfo, setTranslatedInfo] = useState<TranslatedFoodInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { addToHistory } = useHistory('food-recognition');

  const handleCapture = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setError(null);
    setFoodInfo(null);
    setTranslatedInfo(null);
    setCurrentImage(imageBase64);

    try {
      const result = await analyzeFoodImage(imageBase64);
      setFoodInfo(result);

      // Save to history after successful analysis
      if (result && result.dishName) {
        addToHistory(imageBase64, result);
      }
    } catch (err) {
      console.error('Error analyzing food:', err);
      setError(t.foodRecognition.error || 'Cannot recognize food. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentImage(item.image);
    setFoodInfo(item.result);
    setError(null);
  };

  // Auto-translate when language changes
  useEffect(() => {
    async function translateFood() {
      if (language === 'vi' && foodInfo) {
        setIsTranslating(true);
        try {
          const translated: TranslatedFoodInfo = {
            ...foodInfo,
            translatedOrigin: await translateToVietnamese(foodInfo.origin),
            translatedDescription: await translateToVietnamese(foodInfo.description),
            translatedIngredients: await Promise.all(
              foodInfo.ingredients.map((i) => translateToVietnamese(i))
            ),
            translatedHowToEat: await translateToVietnamese(foodInfo.howToEat),
            translatedCulturalSignificance: await translateToVietnamese(foodInfo.culturalSignificance),
          };
          setTranslatedInfo(translated);
        } catch (err) {
          console.error('Translation error:', err);
          setTranslatedInfo(foodInfo);
        } finally {
          setIsTranslating(false);
        }
      } else {
        setTranslatedInfo(foodInfo);
      }
    }

    translateFood();
  }, [language, foodInfo]);

  const formatPrice = (price: FoodInfo['estimatedPrice']) => {
    return `${price.min.toLocaleString()} - ${price.max.toLocaleString()} ${price.currency}`;
  };

  const displayInfo = language === 'vi' && translatedInfo ? translatedInfo : foodInfo;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 pt-16 lg:pt-20">
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
          <h1 className="text-4xl font-bold mb-2">{t.foodRecognition.title}</h1>
          <p className="text-gray-600">{t.foodRecognition.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Camera onCapture={handleCapture} isLoading={isAnalyzing} />
            {isAnalyzing && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <p className="mt-2 text-gray-600">{t.foodRecognition.analyzing}</p>
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

            {displayInfo && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{displayInfo.dishName}</CardTitle>
                    {displayInfo.vietnameseName && language === 'en' && (
                      <p className="text-lg text-gray-600">{displayInfo.vietnameseName}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">
                        {language === 'vi' && 'translatedOrigin' in displayInfo && displayInfo.translatedOrigin
                          ? String(displayInfo.translatedOrigin)
                          : displayInfo.origin}
                      </span>
                    </div>

                    <div>
                      <p className="text-gray-700">
                        {language === 'vi' && 'translatedDescription' in displayInfo && displayInfo.translatedDescription
                          ? String(displayInfo.translatedDescription)
                          : displayInfo.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Utensils className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">{t.foodRecognition.mainIngredients}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {language === 'vi' && 'translatedIngredients' in displayInfo && Array.isArray(displayInfo.translatedIngredients)
                          ? displayInfo.translatedIngredients.map((ingredient, index) => (
                              <Badge key={index} variant="secondary">
                                {ingredient}
                              </Badge>
                            ))
                          : displayInfo.ingredients.map((ingredient, index) => (
                              <Badge key={index} variant="secondary">
                                {ingredient}
                              </Badge>
                            ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">{t.foodRecognition.howToEat}</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {language === 'vi' && 'translatedHowToEat' in displayInfo && displayInfo.translatedHowToEat
                          ? String(displayInfo.translatedHowToEat)
                          : displayInfo.howToEat}
                      </p>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">{t.foodRecognition.culturalSignificance}</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {language === 'vi' && 'translatedCulturalSignificance' in displayInfo && displayInfo.translatedCulturalSignificance
                          ? String(displayInfo.translatedCulturalSignificance)
                          : displayInfo.culturalSignificance}
                      </p>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">{t.foodRecognition.estimatedPrice}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-base px-3 py-1">
                        {formatPrice(displayInfo.estimatedPrice)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!displayInfo && !isAnalyzing && !error && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-gray-500">
                  <p>{t.foodRecognition.noResults}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <HistoryModal
          type="food-recognition"
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectItem={handleSelectHistoryItem}
        />
      </div>
    </div>
  );
}
