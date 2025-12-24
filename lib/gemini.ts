import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Gemini 3 Pro Preview - Latest model (preview version)
// Để dùng model khác, thay đổi tên model:
// - 'gemini-3-pro-preview' - Latest, most capable (preview)
// - 'gemini-1.5-flash' - Fast, high quota (stable)
// - 'gemini-1.5-pro' - Smart, stable
export const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

export async function analyzeMenuImage(imageBase64: string) {
  const prompt = `You are a Vietnamese food expert. Analyze the Vietnamese menu in this image and return JSON in this format (ALL TEXT IN ENGLISH):
  {
    "dishes": [
      {
        "name": "Dish name in English",
        "vietnameseName": "Vietnamese name",
        "description": "Detailed description of taste, ingredients, preparation method",
        "spicyLevel": "none/mild/medium/hot/very hot",
        "allergens": ["peanuts", "shellfish", ...],
        "howToEat": "How to eat properly",
        "price": "Price if available"
      }
    ]
  }

  IMPORTANT: Return all text fields in English. Only 'vietnameseName' should be in Vietnamese.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    },
  ]);

  const response = await result.response;
  const text = response.text();

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return { dishes: [] };
}

export async function analyzeFoodImage(imageBase64: string) {
  const prompt = `You are a Vietnamese food expert. Recognize the dish in this image and return JSON in this format (ALL TEXT IN ENGLISH):
  {
    "dishName": "Dish name in English",
    "vietnameseName": "Vietnamese name",
    "origin": "Origin and region",
    "description": "Detailed description of the dish",
    "ingredients": ["ingredient 1", "ingredient 2", ...],
    "howToEat": "How to eat properly",
    "culturalSignificance": "Cultural significance",
    "estimatedPrice": {
      "min": 30000,
      "max": 50000,
      "currency": "VND"
    }
  }

  IMPORTANT: Return all text fields in English. Only 'vietnameseName' should be in Vietnamese.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    },
  ]);

  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return null;
}

export async function getRecommendations(preferences: {
  location: string;
  days: number;
  budget?: string;
  dietary?: string[];
  spiceLevel?: string;
}) {
  const prompt = `You are a Vietnamese food travel expert. Create a food itinerary for tourists with this information:
  - Location: ${preferences.location}
  - Days: ${preferences.days}
  - Budget: ${preferences.budget || 'medium'}
  - Dietary restrictions: ${preferences.dietary?.join(', ') || 'none'}
  - Spice level: ${preferences.spiceLevel || 'flexible'}

  Return JSON in this format (ALL TEXT IN ENGLISH):
  {
    "itinerary": [
      {
        "day": 1,
        "meals": [
          {
            "time": "Breakfast",
            "dish": "Dish name in English",
            "restaurant": "Restaurant name (if any)",
            "address": "Address",
            "priceRange": "30,000 - 50,000 VND",
            "reason": "Why this recommendation"
          }
        ]
      }
    ],
    "hiddenGems": [
      {
        "name": "Hidden dish/restaurant name",
        "description": "Description",
        "location": "Address"
      }
    ]
  }

  IMPORTANT: Return all text fields in English.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return { itinerary: [], hiddenGems: [] };
}

export async function translateToVietnamese(text: string) {
  const prompt = `Dịch câu sau sang tiếng Việt một cách tự nhiên, phù hợp với ngữ cảnh nhà hàng:
  "${text}"

  Chỉ trả về bản dịch, không giải thích.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

export async function checkBillPrice(imageBase64: string, location: string) {
  const prompt = `You are a price checking expert in ${location}, Vietnam. Analyze the bill in this image and return JSON (ALL TEXT IN ENGLISH):
  {
    "items": [
      {
        "name": "Dish name",
        "price": 50000,
        "averagePrice": 35000,
        "status": "fair/overpriced/scam"
      }
    ],
    "total": 150000,
    "expectedTotal": 100000,
    "verdict": "fair/slightly_high/overpriced/scam",
    "warning": "Warning if there are signs of overcharging",
    "notes": "Notes about pricing"
  }

  IMPORTANT: Return all text fields in English.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    },
  ]);

  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return null;
}
