# Phở.AI - Bilingual Support & Chrome Translation API

## ✅ Đã hoàn thành

### 1. Translation System
- ✅ Chrome Translation API integration ([lib/translation.ts](lib/translation.ts))
- ✅ Translation hooks ([hooks/useTranslation.ts](hooks/useTranslation.ts))
- ✅ Language Context & Provider
- ✅ **Default language: English** (for international tourists)

### 2. Gemini AI Prompts
- ✅ **All prompts return English** results
- ✅ Vietnamese names preserved in `vietnameseName` field
- ✅ Ready for Chrome Translation API to translate to Vietnamese

### 3. UI Components
- ✅ Bilingual UI (English/Vietnamese)
- ✅ Language Switcher (EN/VI)
- ✅ Mobile Menu
- ✅ Back to Top Button
- ✅ Footer with ToanWeb credit

---

## 🌐 Chrome Translation API

### Cách hoạt động

1. **AI trả về tiếng Anh** (fast, consistent)
2. **User click VI** → Chrome Translation API dịch sang tiếng Việt
3. **Real-time translation** - không cần gọi AI lại

### Setup Chrome Translation API

⚠️ **IMPORTANT:** Chrome Translation API đang ở giai đoạn **Experimental**. Cần Chrome 130+ và enable flags.

#### Bước 1: Cài đặt Chrome Canary
- Download: https://www.google.com/chrome/canary/
- Hoặc dùng Chrome 130+ stable

#### Bước 2: Enable Flags
1. Mở: `chrome://flags`
2. Tìm và enable các flags sau:
   - **Translation API**
     `chrome://flags/#translation-api`
   - **Optimization Guide On Device Model**
     `chrome://flags/#optimization-guide-on-device-model`
   - **Prompt API for Gemini Nano**
     `chrome://flags/#prompt-api-for-gemini-nano`
3. Click **Relaunch**

#### Bước 3: Download Translation Model
1. Mở: `chrome://components`
2. Tìm **"Translate"** component
3. Click **"Check for update"**
4. Đợi model download (có thể mất vài phút)

#### Bước 4: Verify
Mở Console (F12) và chạy:
```javascript
if ('translation' in window) {
  console.log('✅ Translation API available!');
} else {
  console.log('❌ Translation API not available');
}
```

---

## 📱 Cách sử dụng

### 1. Translation Hook (Recommended)

```typescript
'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MyComponent() {
  const { language } = useLanguage();
  const [result, setResult] = useState('This is English text');

  // Automatically translates when language changes to 'vi'
  const translatedText = useTranslation(result);

  return <p>{translatedText}</p>;
}
```

### 2. Translate Object

```typescript
import { useObjectTranslation } from '@/hooks/useTranslation';

const foodData = {
  dishName: 'Grilled Pork Rice',
  description: 'Delicious grilled pork...',
  ingredients: ['pork', 'rice', 'vegetables']
};

// Specify which keys to translate
const translatedData = useObjectTranslation(
  foodData,
  ['dishName', 'description', 'ingredients']
);
```

### 3. Manual Translation

```typescript
import { translateToVietnamese, initTranslator } from '@/lib/translation';

// Initialize once
await initTranslator();

// Translate text
const vietnamese = await translateToVietnamese('Hello world');
```

---

##Pages cần update

Tất cả pages sau cần update để support auto-translation:

1. ✅ **Home page** - Đã xong
2. ⏳ **Scanner** ([app/scanner/page.tsx](app/scanner/page.tsx))
3. ⏳ **Food Recognition** ([app/food-recognition/page.tsx](app/food-recognition/page.tsx))
4. ⏳ **Voice Assistant** ([app/voice-assistant/page.tsx](app/voice-assistant/page.tsx))
5. ⏳ **Recommendations** ([app/recommendations/page.tsx](app/recommendations/page.tsx))
6. ⏳ **Price Check** ([app/price-check/page.tsx](app/price-check/page.tsx))

### Template để update pages:

```typescript
'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function ScannerPage() {
  const { t } = useLanguage(); // For UI text
  const [aiResult, setAiResult] = useState(''); // AI result in English

  // Auto-translate AI result
  const translatedResult = useTranslation(aiResult);

  return (
    <div>
      <h1>{t.scanner.title}</h1>
      <p>{translatedResult}</p>
    </div>
  );
}
```

---

## 🚀 Benefits

### Chrome Translation API vs Gemini Translation

| Feature | Chrome Translation API | Gemini AI |
|---------|----------------------|-----------|
| Speed | ⚡ Instant (on-device) | 🐌 API call (~2s) |
| Cost | 💰 FREE | 💰 Uses API quota |
| Privacy | 🔒 On-device | ☁️ Cloud |
| Offline | ✅ Works offline | ❌ Need internet |
| Quality | ✅ Good for general text | ✅ Better for context |

### Our Approach:
- **AI returns English** → Fast, consistent, saves quota
- **Browser translates to Vietnamese** → Free, instant, works offline
- **Best of both worlds!**

---

## 🔧 Troubleshooting

### "Translation API not available"
- ✅ Check Chrome version (need 130+)
- ✅ Enable flags in `chrome://flags`
- ✅ Download translation model in `chrome://components`
- ✅ Restart Chrome

### Translation not working
- ✅ Check Console for errors (F12)
- ✅ Run setup instructions again
- ✅ Try Chrome Canary

### Slow translation
- ✅ First translation may be slow (model loading)
- ✅ Subsequent translations are instant
- ✅ Translation happens on-device (no internet needed)

---

## 📖 References

- Chrome Translation API Docs: https://developer.chrome.com/docs/ai/translator-api
- Chrome Built-in AI: https://developer.chrome.com/docs/ai/built-in
- Gemini API: https://ai.google.dev/

---

## 💡 Next Steps

1. **Update remaining pages** với translation support
2. **Test Chrome Translation API** trên Chrome Canary
3. **Fallback strategy** nếu Translation API không available:
   - Option 1: Show English (default)
   - Option 2: Use Gemini API to translate (slower, costs quota)
   - Option 3: Pre-translate common phrases

---

Made with ❤️ by [ToanWeb](https://doxuantoan.com)
