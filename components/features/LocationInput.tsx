'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Popular locations in Vietnam for quick suggestions
const POPULAR_LOCATIONS = {
  vi: [
    'Quận 1, Hồ Chí Minh',
    'Quận 3, Hồ Chí Minh',
    'Quận 5, Hồ Chí Minh',
    'Phú Nhuận, Hồ Chí Minh',
    'Bình Thạnh, Hồ Chí Minh',
    'Tân Bình, Hồ Chí Minh',
    'Hoàn Kiếm, Hà Nội',
    'Ba Đình, Hà Nội',
    'Đống Đa, Hà Nội',
    'Hai Bà Trưng, Hà Nội',
    'Cầu Giấy, Hà Nội',
    'Thanh Xuân, Hà Nội',
    'Hải Châu, Đà Nẵng',
    'Sơn Trà, Đà Nẵng',
    'Ngũ Hành Sơn, Đà Nẵng',
  ],
  en: [
    'District 1, Ho Chi Minh City',
    'District 3, Ho Chi Minh City',
    'District 5, Ho Chi Minh City',
    'Phu Nhuan, Ho Chi Minh City',
    'Binh Thanh, Ho Chi Minh City',
    'Tan Binh, Ho Chi Minh City',
    'Hoan Kiem, Hanoi',
    'Ba Dinh, Hanoi',
    'Dong Da, Hanoi',
    'Hai Ba Trung, Hanoi',
    'Cau Giay, Hanoi',
    'Thanh Xuan, Hanoi',
    'Hai Chau, Da Nang',
    'Son Tra, Da Nang',
    'Ngu Hanh Son, Da Nang',
  ],
};

export default function LocationInput({ value, onChange, placeholder }: LocationInputProps) {
  const { language } = useLanguage();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const suggestions = POPULAR_LOCATIONS[language as keyof typeof POPULAR_LOCATIONS] || POPULAR_LOCATIONS.en;

  // Filter suggestions based on input
  useEffect(() => {
    if (value) {
      const filtered = suggestions.filter((loc) =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions(suggestions.slice(0, 5)); // Show top 5 when empty
      setShowSuggestions(false);
    }
  }, [value, language]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(language === 'vi'
        ? 'Trình duyệt không hỗ trợ định vị'
        : 'Geolocation is not supported by your browser'
      );
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try to reverse geocode using OpenStreetMap Nominatim (free, no API key needed)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${language}`
          );
          const data = await response.json();

          if (data.address) {
            // Build location string from address components
            const parts = [];
            if (data.address.suburb || data.address.neighbourhood) {
              parts.push(data.address.suburb || data.address.neighbourhood);
            }
            if (data.address.city || data.address.town) {
              parts.push(data.address.city || data.address.town);
            }

            const locationStr = parts.length > 0
              ? parts.join(', ')
              : data.display_name.split(',').slice(0, 2).join(',');

            onChange(locationStr);
          } else {
            // Fallback to coordinates
            onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          // Fallback to coordinates
          onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(language === 'vi'
          ? 'Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập.'
          : 'Unable to get location. Please check permissions.'
        );
        setIsGettingLocation(false);
      }
    );
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="pr-10"
          />
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          title={language === 'vi' ? 'Sử dụng vị trí hiện tại' : 'Use current location'}
        >
          {isGettingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
