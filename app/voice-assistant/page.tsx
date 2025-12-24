'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, Volume2, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { translateToVietnamese } from '@/lib/gemini';
import { useLanguage } from '@/contexts/LanguageContext';

export default function VoiceAssistant() {
  const { t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          handleTranslate(text);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setError(t.voiceAssistant.error || 'Speech recognition error. Please try again.');
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setError(t.voiceAssistant.notSupported || 'Your browser does not support speech recognition.');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [t]);

  const handleTranslate = async (text: string) => {
    setIsTranslating(true);
    setError(null);
    try {
      const result = await translateToVietnamese(text);
      setTranslation(result);
    } catch (err) {
      console.error('Translation error:', err);
      setError(t.voiceAssistant.translationError || 'Cannot translate. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setError(null);
      setTranscript('');
      setTranslation('');
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakVietnamese = () => {
    if (translation && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translation);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 pt-16 lg:pt-4">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backToHome}
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{t.voiceAssistant.title}</h1>
          <p className="text-gray-600">{t.voiceAssistant.subtitle}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                {t.voiceAssistant.selectLanguage}
              </CardTitle>
              <CardDescription>
                {t.voiceAssistant.speakInYourLanguage}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguage === lang.code ? 'default' : 'outline'}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className="h-auto py-3"
                    disabled={isListening}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{lang.flag}</div>
                      <div className="text-sm">{lang.name}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Button
                  size="lg"
                  onClick={isListening ? stopListening : startListening}
                  className={`w-32 h-32 rounded-full ${
                    isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : ''
                  }`}
                  disabled={!!error && error.includes(t.voiceAssistant.notSupported || 'not support')}
                >
                  <Mic className="h-12 w-12" />
                </Button>

                <div>
                  {isListening ? (
                    <p className="text-lg font-medium text-purple-600">{t.voiceAssistant.listening}</p>
                  ) : (
                    <p className="text-gray-600">{t.voiceAssistant.pressToSpeak}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}

          {transcript && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.voiceAssistant.youSaid}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={transcript}
                  readOnly
                  className="min-h-[80px] text-base"
                />
              </CardContent>
            </Card>
          )}

          {(translation || isTranslating) && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge>Tiếng Việt</Badge>
                    {t.voiceAssistant.translation}
                  </CardTitle>
                  {translation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={speakVietnamese}
                      className="bg-white"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      {t.voiceAssistant.pronounce}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isTranslating ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <p className="mt-2 text-sm text-gray-600">{t.voiceAssistant.translating}</p>
                  </div>
                ) : (
                  <Textarea
                    value={translation}
                    readOnly
                    className="min-h-[80px] text-base bg-white"
                  />
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-lg">{t.voiceAssistant.usageTips}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{t.voiceAssistant.tip1}</p>
              <p>{t.voiceAssistant.tip2}</p>
              <p>{t.voiceAssistant.tip3}</p>
              <p>{t.voiceAssistant.tip4}</p>
              <p>{t.voiceAssistant.tip5}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
