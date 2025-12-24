# Phở.AI - Your ALL-IN-ONE Vietnamese Food Assistant

Ứng dụng AI giải quyết mọi vấn đề ẩm thực cho du khách tại Việt Nam, được xây dựng với Next.js 14, Firebase, và Gemini AI.

## Tính năng chính

### 📸 Menu Scanner
- Chụp ảnh menu tiếng Việt → Gemini AI dịch và giải thích từng món
- Mô tả chi tiết: vị, nguyên liệu, độ cay, cách ăn
- Cảnh báo dị ứng (đậu phộng, hải sản, v.v.)

### 🍲 Food Recognition
- Nhận diện tên món qua ảnh
- Giải thích nguồn gốc, cách làm, ý nghĩa văn hóa
- Gợi ý cách ăn đúng cách (phở, bánh xèo, nem rán...)
- Estimate giá hợp lý ở khu vực đó

### 🗣️ Voice Assistant
- Hỗ trợ đa ngôn ngữ: English, 한국어, 中文, 日本語
- Nói bằng ngôn ngữ của bạn → AI dịch sang tiếng Việt
- Phát âm tên món cho người bản địa nghe hiểu
- Dịch các câu giao tiếp trong nhà hàng

### 🎯 Smart Recommendations
- Tạo lịch trình ăn uống chi tiết cho chuyến du lịch
- Lọc theo: budget, khẩu vị, hạn chế ăn kiêng (halal, chay, gluten-free)
- Gợi ý món địa phương ít người biết
- Route tối ưu theo số ngày ở mỗi địa điểm

### 💰 Price Check & Scam Alert
- Chụp bill → AI check giá có hợp lý không
- Cảnh báo nếu bị chặt chém
- So sánh giá trung bình khu vực
- Phân tích chi tiết từng món

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui
- **AI**: Gemini 2.0 Flash (Google AI)
- **Camera**: react-webcam + Web APIs
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth
- **Deploy**: Vercel

## Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn
- Tài khoản Firebase
- Gemini API Key

## Hướng dẫn cài đặt

### 1. Clone repository

```bash
cd pho-ai
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Setup Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Bật **Firestore Database**:
   - Vào Firestore Database
   - Click "Create database"
   - Chọn mode "Start in test mode" (development)
   - Chọn location gần Việt Nam (asia-southeast1)

4. Bật **Storage**:
   - Vào Storage
   - Click "Get started"
   - Chọn test mode

5. Bật **Authentication** (optional):
   - Vào Authentication
   - Click "Get started"
   - Enable "Email/Password" provider

6. Lấy Firebase config:
   - Vào Project Settings (⚙️)
   - Scroll xuống "Your apps"
   - Click vào web app (</>) hoặc tạo mới
   - Copy config values

### 4. Setup Gemini API

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập bằng Google account
3. Click "Create API Key"
4. Copy API key

### 5. Tạo file .env.local

```bash
cp .env.example .env.local
```

Mở file `.env.local` và điền thông tin:

```env
# Gemini AI API Key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 6. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Deploy lên Vercel

### Cách 1: Deploy qua Vercel Dashboard

1. Push code lên GitHub repository
2. Truy cập [Vercel](https://vercel.com)
3. Click "New Project"
4. Import GitHub repository
5. Thêm Environment Variables (copy từ .env.local)
6. Click "Deploy"

### Cách 2: Deploy qua Vercel CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

## Cấu trúc thư mục

```
pho-ai/
├── app/
│   ├── scanner/              # Menu Scanner page
│   ├── food-recognition/     # Food Recognition page
│   ├── voice-assistant/      # Voice Assistant page
│   ├── recommendations/      # Smart Recommendations page
│   ├── price-check/          # Price Check page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   ├── features/
│   │   └── Camera.tsx        # Camera component
│   └── ui/                   # Shadcn UI components
├── lib/
│   ├── firebase/
│   │   └── config.ts         # Firebase configuration
│   ├── gemini.ts             # Gemini AI functions
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

## Tính năng Voice Assistant

Voice Assistant sử dụng Web Speech API, cần:
- **Chrome/Edge**: Hỗ trợ đầy đủ
- **Firefox**: Hỗ trợ hạn chế
- **Safari**: Cần bật microphone permission
- **HTTPS**: Bắt buộc cho production (localhost OK cho dev)

## Troubleshooting

### Lỗi Camera không hoạt động
- Kiểm tra browser đã cấp quyền camera
- Nếu deploy production, cần HTTPS
- Thử tắt extensions chặn camera

### Lỗi Gemini API
- Kiểm tra API key đúng chưa
- Kiểm tra đã enable Gemini API trong Google Cloud Console
- Kiểm tra quota limit

### Lỗi Firebase
- Kiểm tra Firebase config đúng chưa
- Kiểm tra Firestore rules (test mode cho development)
- Kiểm tra region có hỗ trợ không

### Lỗi Voice Recognition
- Chỉ hoạt động trên HTTPS hoặc localhost
- Cần cấp quyền microphone
- Thử browser khác (khuyến nghị Chrome)

## Development Tips

### Chạy build local

```bash
npm run build
npm start
```

### Type checking

```bash
npx tsc --noEmit
```

### Lint code

```bash
npm run lint
```

## Tính năng sắp tới

- [ ] User Authentication
- [ ] Lưu lịch sử scan
- [ ] Bookmark món ăn yêu thích
- [ ] Share recommendations
- [ ] Offline mode
- [ ] Progressive Web App (PWA)
- [ ] Đa ngôn ngữ UI
- [ ] Review và rating nhà hàng
- [ ] Map integration
- [ ] Chat với AI về ẩm thực

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - xem file LICENSE để biết thêm chi tiết.

## Contact

- GitHub Issues: [Report bugs](https://github.com/yourusername/pho-ai/issues)
- Email: your.email@example.com

## Credits

- Powered by [Gemini AI](https://ai.google.dev/)
- UI Components by [Shadcn/ui](https://ui.shadcn.com/)
- Built with [Next.js](https://nextjs.org/)
- Hosted on [Vercel](https://vercel.com/)

---

Made with ❤️ for travelers in Vietnam
