'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, History } from 'lucide-react';
import Camera from '@/components/features/Camera';
import LocationInput from '@/components/features/LocationInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkBillPrice } from '@/lib/gemini';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateToVietnamese } from '@/lib/translation';
import { useHistory } from '@/hooks/useHistory';
import HistoryModal from '@/components/HistoryModal';
import { HistoryItem } from '@/lib/history';

interface BillItem {
  name: string;
  price: number;
  averagePrice: number;
  status: 'fair' | 'overpriced' | 'scam';
}

interface BillAnalysis {
  items: BillItem[];
  total: number;
  expectedTotal: number;
  verdict: 'fair' | 'slightly_high' | 'overpriced' | 'scam';
  warning?: string;
  notes: string;
}

interface TranslatedBillItem extends BillItem {
  translatedName?: string;
}

interface TranslatedBillAnalysis extends BillAnalysis {
  items: TranslatedBillItem[];
  translatedWarning?: string;
  translatedNotes?: string;
}

export default function PriceCheck() {
  const { t, language } = useLanguage();
  const [location, setLocation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);
  const [translatedAnalysis, setTranslatedAnalysis] = useState<TranslatedBillAnalysis | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { addToHistory } = useHistory('price-check');

  const handleCapture = async (imageBase64: string) => {
    if (!location) {
      setError(t.priceCheck.enterLocation || 'Please enter a location before taking a photo');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setTranslatedAnalysis(null);
    setCurrentImage(imageBase64);

    try {
      const result = await checkBillPrice(imageBase64, location);
      setAnalysis(result);

      // Save to history after successful analysis
      if (result && result.items && result.items.length > 0) {
        addToHistory(imageBase64, result, location);
      }
    } catch (err) {
      console.error('Error analyzing bill:', err);
      setError(t.priceCheck.error || 'Cannot analyze bill. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentImage(item.image);
    setAnalysis(item.result);
    if (item.location) {
      setLocation(item.location);
    }
    setError(null);
  };

  // Auto-translate when language changes
  useEffect(() => {
    async function translateAnalysis() {
      if (language === 'vi' && analysis) {
        setIsTranslating(true);
        try {
          const translatedItems = await Promise.all(
            analysis.items.map(async (item) => ({
              ...item,
              translatedName: await translateToVietnamese(item.name),
            }))
          );

          setTranslatedAnalysis({
            ...analysis,
            items: translatedItems,
            translatedWarning: analysis.warning ? await translateToVietnamese(analysis.warning) : undefined,
            translatedNotes: await translateToVietnamese(analysis.notes),
          });
        } catch (err) {
          console.error('Translation error:', err);
          // Fallback to original
          setTranslatedAnalysis(analysis as TranslatedBillAnalysis);
        } finally {
          setIsTranslating(false);
        }
      } else if (analysis) {
        setTranslatedAnalysis(analysis as TranslatedBillAnalysis);
      }
    }

    translateAnalysis();
  }, [language, analysis]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fair':
        return 'bg-green-100 text-green-800';
      case 'overpriced':
        return 'bg-orange-100 text-orange-800';
      case 'scam':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fair':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'overpriced':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'scam':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'fair':
        return 'border-green-500 bg-green-50';
      case 'slightly_high':
        return 'border-yellow-500 bg-yellow-50';
      case 'overpriced':
        return 'border-orange-500 bg-orange-50';
      case 'scam':
        return 'border-red-500 bg-red-50';
      default:
        return '';
    }
  };

  const getVerdictText = (verdict: string) => {
    const verdictMap = {
      en: {
        fair: 'Fair Price',
        slightly_high: 'Slightly High',
        overpriced: 'Overpriced',
        scam: '⚠️ WARNING: Possible Scam!',
      },
      vi: {
        fair: 'Giá hợp lý',
        slightly_high: 'Hơi cao',
        overpriced: 'Đắt hơn bình thường',
        scam: '⚠️ CẢNH BÁO: Có dấu hiệu chặt chém!',
      },
    };
    return verdictMap[language][verdict as keyof typeof verdictMap.en] || '';
  };

  const getItemStatusText = (status: string) => {
    const statusMap = {
      en: {
        fair: 'OK',
        overpriced: 'High',
        scam: 'Too High',
      },
      vi: {
        fair: 'OK',
        overpriced: 'Hơi đắt',
        scam: 'Quá đắt',
      },
    };
    return statusMap[language][status as keyof typeof statusMap.en] || '';
  };

  const displayAnalysis = language === 'vi' && translatedAnalysis ? translatedAnalysis : analysis;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50 pt-16 lg:pt-20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
          <h1 className="text-4xl font-bold mb-2">{t.priceCheck.title}</h1>
          <p className="text-gray-600">{t.priceCheck.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.priceCheck.locationInfo}</CardTitle>
                <CardDescription>
                  {t.priceCheck.locationDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LocationInput
                  placeholder={t.priceCheck.locationPlaceholder}
                  value={location}
                  onChange={setLocation}
                />
              </CardContent>
            </Card>

            <Camera onCapture={handleCapture} isLoading={isAnalyzing} />

            {isAnalyzing && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <p className="mt-2 text-gray-600">{t.priceCheck.analyzing}</p>
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

            {displayAnalysis && (
              <div className="space-y-4">
                <Card className={`border-2 ${getVerdictColor(displayAnalysis.verdict)}`}>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {getStatusIcon(displayAnalysis.verdict)}
                      {getVerdictText(displayAnalysis.verdict)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{t.priceCheck.totalOnBill}</p>
                        <p className="text-2xl font-bold">
                          {displayAnalysis.total.toLocaleString()} VND
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t.priceCheck.expectedTotal}</p>
                        <p className="text-2xl font-bold text-green-600">
                          {displayAnalysis.expectedTotal.toLocaleString()} VND
                        </p>
                      </div>
                    </div>

                    {displayAnalysis.total > displayAnalysis.expectedTotal && (
                      <div className="p-3 bg-red-100 rounded-md">
                        <p className="text-sm font-medium text-red-900">
                          {language === 'en'
                            ? `${((displayAnalysis.total - displayAnalysis.expectedTotal) / displayAnalysis.expectedTotal * 100).toFixed(0)}% higher than average (${(displayAnalysis.total - displayAnalysis.expectedTotal).toLocaleString()} VND)`
                            : `Cao hơn ${((displayAnalysis.total - displayAnalysis.expectedTotal) / displayAnalysis.expectedTotal * 100).toFixed(0)}% so với giá trung bình (${(displayAnalysis.total - displayAnalysis.expectedTotal).toLocaleString()} VND)`}
                        </p>
                      </div>
                    )}

                    {displayAnalysis.warning && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-900">
                            {language === 'vi' && 'translatedWarning' in displayAnalysis && displayAnalysis.translatedWarning
                              ? String(displayAnalysis.translatedWarning)
                              : displayAnalysis.warning}
                          </p>
                        </div>
                      </div>
                    )}

                    {displayAnalysis.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-700">
                          {language === 'vi' && 'translatedNotes' in displayAnalysis && displayAnalysis.translatedNotes
                            ? String(displayAnalysis.translatedNotes)
                            : displayAnalysis.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t.priceCheck.itemDetails}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {displayAnalysis.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-3 border rounded-md"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(item.status)}
                              <h4 className="font-medium">
                                {language === 'vi' && 'translatedName' in item && item.translatedName
                                  ? String(item.translatedName)
                                  : item.name}
                              </h4>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                {language === 'en' ? 'Price on bill: ' : 'Giá trên bill: '}
                                {item.price.toLocaleString()} VND
                              </p>
                              <p>
                                {language === 'en' ? 'Average price: ' : 'Giá trung bình: '}
                                {item.averagePrice.toLocaleString()} VND
                              </p>
                              {item.price > item.averagePrice && (
                                <p className="text-orange-600 font-medium">
                                  +{((item.price - item.averagePrice) / item.averagePrice * 100).toFixed(0)}%
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            {getItemStatusText(item.status)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!displayAnalysis && !isAnalyzing && !error && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-gray-500 py-12">
                  <p>{t.priceCheck.noResults}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle>{t.priceCheck.tipsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{t.priceCheck.tip1}</p>
            <p>{t.priceCheck.tip2}</p>
            <p>{t.priceCheck.tip3}</p>
            <p>{t.priceCheck.tip4}</p>
            <p>{t.priceCheck.tip5}</p>
          </CardContent>
        </Card>

        <HistoryModal
          type="price-check"
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectItem={handleSelectHistoryItem}
        />
      </div>
    </div>
  );
}
