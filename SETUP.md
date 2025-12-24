# Hướng dẫn Setup nhanh - Phở.AI

## Các bước setup (5 phút)

### 1. Cài đặt dependencies
```bash
cd pho-ai
npm install
```

### 2. Lấy Gemini API Key (MIỄN PHÍ)
1. Vào https://makersuite.google.com/app/apikey
2. Đăng nhập Google
3. Click "Create API Key"
4. Copy key

### 3. Setup Firebase (MIỄN PHÍ)
1. Vào https://console.firebase.google.com/
2. Click "Add project" → Nhập tên project
3. Disable Google Analytics (không cần) → Create project
4. Đợi 1 phút để Firebase tạo xong

#### Enable Firestore:
1. Vào **Firestore Database** (menu bên trái)
2. Click "Create database"
3. Chọn **"Start in test mode"**
4. Location: **asia-southeast1** (Singapore - gần VN)
5. Click "Enable"

#### Enable Storage:
1. Vào **Storage** (menu bên trái)
2. Click "Get started"
3. Chọn **"Start in test mode"**
4. Click "Next" → "Done"

#### Lấy Firebase Config:
1. Vào **Project Settings** (biểu tượng ⚙️ bên trái)
2. Scroll xuống phần "Your apps"
3. Click biểu tượng **</>** (Web)
4. Nhập tên app: "Pho AI" → Click "Register app"
5. Copy đoạn config (firebaseConfig)

### 4. Tạo file .env.local
Tạo file `.env.local` trong thư mục `pho-ai`:

```env
# Gemini API Key (từ bước 2)
NEXT_PUBLIC_GEMINI_API_KEY=AIza...

# Firebase Config (từ bước 3)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Chạy app
```bash
npm run dev
```

Mở http://localhost:3000

## Troubleshooting nhanh

### Lỗi "GEMINI_API_KEY is not defined"
→ Kiểm tra file `.env.local` đã tạo chưa và có API key chưa

### Lỗi "Firebase: Error (auth/invalid-api-key)"
→ Kiểm tra lại Firebase config trong `.env.local`

### Lỗi Camera không bật được
→ Browser cần cấp quyền camera. Click "Allow" khi browser hỏi

### Lỗi Voice Assistant không hoạt động
→ Chỉ hoạt động trên Chrome/Edge. Firefox/Safari hỗ trợ hạn chế

## Deploy lên Vercel (MIỄN PHÍ)

### Option 1: GitHub + Vercel Dashboard
1. Push code lên GitHub
2. Vào https://vercel.com → Login bằng GitHub
3. Click "New Project" → Import repository
4. Thêm Environment Variables (copy từ .env.local)
5. Click "Deploy"

### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

## Câu hỏi thường gặp

**Q: Chi phí để chạy app này?**
A: MIỄN PHÍ hoàn toàn với:
- Gemini API: Free tier 60 requests/minute
- Firebase: Free tier (Spark plan)
- Vercel: Free tier

**Q: Có cần credit card không?**
A: Không cần! Tất cả đều có free tier

**Q: App có hoạt động offline không?**
A: Chưa. Cần internet để gọi Gemini API. Sẽ có PWA offline mode trong tương lai.

**Q: Tôi có thể tùy chỉnh AI responses không?**
A: Có! Edit các prompts trong file `lib/gemini.ts`

**Q: Làm sao để thay đổi ngôn ngữ UI?**
A: Hiện tại UI là tiếng Việt + English. Có thể tự edit text trong các file page.tsx

## Support

Có vấn đề? Tạo issue tại GitHub hoặc email: your.email@example.com
