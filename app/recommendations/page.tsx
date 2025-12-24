'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, DollarSign, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { getRecommendations } from '@/lib/gemini';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateToVietnamese } from '@/lib/translation';

interface Meal {
  time: string;
  dish: string;
  restaurant?: string;
  address: string;
  priceRange: string;
  reason: string;
}

interface DayItinerary {
  day: number;
  meals: Meal[];
}

interface HiddenGem {
  name: string;
  description: string;
  location: string;
}

interface Recommendations {
  itinerary: DayItinerary[];
  hiddenGems: HiddenGem[];
}

interface TranslatedMeal extends Meal {
  translatedDish?: string;
  translatedRestaurant?: string;
  translatedAddress?: string;
  translatedReason?: string;
}

interface TranslatedDayItinerary {
  day: number;
  meals: TranslatedMeal[];
}

interface TranslatedHiddenGem extends HiddenGem {
  translatedName?: string;
  translatedDescription?: string;
  translatedLocation?: string;
}

interface TranslatedRecommendations {
  itinerary: TranslatedDayItinerary[];
  hiddenGems: TranslatedHiddenGem[];
}

export default function SmartRecommendations() {
  const { t, language } = useLanguage();
  const [location, setLocation] = useState('');
  const [days, setDays] = useState('2');
  const [budget, setBudget] = useState('medium');
  const [dietary, setDietary] = useState<string[]>([]);
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [translatedRecommendations, setTranslatedRecommendations] = useState<TranslatedRecommendations | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const budgetOptions = [
    { value: 'low', label: language === 'en' ? 'Budget (< 100k/meal)' : 'Budget (< 100k/bữa)', icon: '💰' },
    { value: 'medium', label: language === 'en' ? 'Medium (100k-300k)' : 'Trung bình (100k-300k)', icon: '💵' },
    { value: 'high', label: language === 'en' ? 'Premium (> 300k)' : 'Cao cấp (> 300k)', icon: '💎' },
  ];

  const dietaryOptions = language === 'en'
    ? ['Halal', 'Vegetarian', 'Gluten-free', 'No seafood']
    : ['Halal', 'Chay (Vegetarian)', 'Gluten-free', 'Không hải sản'];
  const spiceLevels = language === 'en'
    ? ['No spice', 'Mild', 'Medium', 'Very spicy']
    : ['Không cay', 'Ít cay', 'Vừa cay', 'Rất cay'];

  const toggleDietary = (option: string) => {
    setDietary((prev) =>
      prev.includes(option) ? prev.filter((d) => d !== option) : [...prev, option]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      setError(t.recommendations.enterLocation || 'Please enter a location');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    setTranslatedRecommendations(null);

    try {
      const result = await getRecommendations({
        location,
        days: parseInt(days),
        budget,
        dietary,
        spiceLevel,
      });
      setRecommendations(result);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError(t.recommendations.error || 'Cannot get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-translate when language changes
  useEffect(() => {
    async function translateRecommendations() {
      if (language === 'vi' && recommendations) {
        setIsTranslating(true);
        try {
          const translatedItinerary = await Promise.all(
            recommendations.itinerary.map(async (day) => ({
              day: day.day,
              meals: await Promise.all(
                day.meals.map(async (meal) => ({
                  ...meal,
                  translatedDish: await translateToVietnamese(meal.dish),
                  translatedRestaurant: meal.restaurant ? await translateToVietnamese(meal.restaurant) : undefined,
                  translatedAddress: await translateToVietnamese(meal.address),
                  translatedReason: await translateToVietnamese(meal.reason),
                }))
              ),
            }))
          );

          const translatedGems = await Promise.all(
            recommendations.hiddenGems.map(async (gem) => ({
              ...gem,
              translatedName: await translateToVietnamese(gem.name),
              translatedDescription: await translateToVietnamese(gem.description),
              translatedLocation: await translateToVietnamese(gem.location),
            }))
          );

          setTranslatedRecommendations({
            itinerary: translatedItinerary,
            hiddenGems: translatedGems,
          });
        } catch (err) {
          console.error('Translation error:', err);
          // Fallback to original
          setTranslatedRecommendations({
            itinerary: recommendations.itinerary,
            hiddenGems: recommendations.hiddenGems,
          });
        } finally {
          setIsTranslating(false);
        }
      } else if (recommendations) {
        setTranslatedRecommendations({
          itinerary: recommendations.itinerary,
          hiddenGems: recommendations.hiddenGems,
        });
      }
    }

    translateRecommendations();
  }, [language, recommendations]);

  const displayRecommendations = language === 'vi' && translatedRecommendations ? translatedRecommendations : (recommendations ? { itinerary: recommendations.itinerary, hiddenGems: recommendations.hiddenGems } : null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 pt-16 lg:pt-4">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backToHome}
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{t.recommendations.title}</h1>
          <p className="text-gray-600">{t.recommendations.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{t.recommendations.tripInfo}</CardTitle>
                <CardDescription>{t.recommendations.fillInfo}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t.recommendations.location}</label>
                    <LocationAutocomplete
                      placeholder={t.recommendations.locationPlaceholder}
                      value={location}
                      onChange={setLocation}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t.recommendations.numberOfDays}</label>
                    <Input
                      type="number"
                      min="1"
                      max="7"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t.recommendations.budget}</label>
                    <div className="space-y-2">
                      {budgetOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={budget === option.value ? 'default' : 'outline'}
                          className="w-full justify-start"
                          onClick={() => setBudget(option.value)}
                        >
                          <span className="mr-2">{option.icon}</span>
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t.recommendations.dietary}</label>
                    <div className="flex flex-wrap gap-2">
                      {dietaryOptions.map((option) => (
                        <Badge
                          key={option}
                          variant={dietary.includes(option) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleDietary(option)}
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t.recommendations.spiceLevel}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {spiceLevels.map((level) => (
                        <Button
                          key={level}
                          type="button"
                          variant={spiceLevel === level ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSpiceLevel(level)}
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t.recommendations.generating : t.recommendations.getRecommendations}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-800">{error}</p>
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">{t.recommendations.aiGenerating}</p>
              </div>
            )}

            {isTranslating && language === 'vi' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-blue-800 text-sm">Đang dịch sang tiếng Việt...</p>
                </CardContent>
              </Card>
            )}

            {displayRecommendations && (
              <>
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    {language === 'en' ? `${days}-day itinerary in ${location}` : `Lịch trình ${days} ngày tại ${location}`}
                  </h2>
                  <div className="space-y-6">
                    {displayRecommendations.itinerary.map((day) => (
                      <Card key={day.day}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-green-600" />
                            {language === 'en' ? `Day ${day.day}` : `Ngày ${day.day}`}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {day.meals.map((meal, index) => (
                              <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <Badge variant="outline" className="mb-2">
                                      {meal.time}
                                    </Badge>
                                    <h4 className="font-semibold text-lg">
                                      {language === 'vi' && 'translatedDish' in meal && meal.translatedDish
                                        ? String(meal.translatedDish)
                                        : meal.dish}
                                    </h4>
                                    {meal.restaurant && (
                                      <p className="text-sm text-gray-600">
                                        {language === 'vi' && 'translatedRestaurant' in meal && meal.translatedRestaurant
                                          ? String(meal.translatedRestaurant)
                                          : meal.restaurant}
                                      </p>
                                    )}
                                  </div>
                                  <Badge className="bg-green-100 text-green-800">
                                    {meal.priceRange}
                                  </Badge>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>
                                    {language === 'vi' && 'translatedAddress' in meal && meal.translatedAddress
                                      ? String(meal.translatedAddress)
                                      : meal.address}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 italic">
                                  {language === 'vi' && 'translatedReason' in meal && meal.translatedReason
                                    ? String(meal.translatedReason)
                                    : meal.reason}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {displayRecommendations.hiddenGems && displayRecommendations.hiddenGems.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                      {t.recommendations.hiddenGems}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {displayRecommendations.hiddenGems.map((gem, index) => (
                        <Card key={index} className="border-yellow-200 bg-yellow-50">
                          <CardHeader>
                            <CardTitle className="text-lg">
                              {language === 'vi' && 'translatedName' in gem && gem.translatedName
                                ? String(gem.translatedName)
                                : gem.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm text-gray-700">
                              {language === 'vi' && 'translatedDescription' in gem && gem.translatedDescription
                                ? String(gem.translatedDescription)
                                : gem.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {language === 'vi' && 'translatedLocation' in gem && gem.translatedLocation
                                  ? String(gem.translatedLocation)
                                  : gem.location}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!displayRecommendations && !isLoading && !error && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-gray-500 py-12">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>{t.recommendations.noResults}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
