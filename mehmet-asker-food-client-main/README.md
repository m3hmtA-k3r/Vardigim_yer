# Food Delivery App - Frontend

Bu proje Next.js 14 kullanılarak geliştirilmiş bir yemek sipariş uygulamasının frontend kısmıdır.

## 🚀 Teknolojiler

- **Next.js 14**: React framework'ü
- **TypeScript**: Tip güvenliği için
- **Redux Toolkit**: State yönetimi
- **Ant Design**: UI component kütüphanesi
- **Tailwind CSS**: Stil ve tasarım için
- **Axios**: HTTP istekleri için

## 📁 Proje Yapısı

```
client/
├── app/                    # Next.js app router
│   ├── admin/             # Admin paneli sayfaları
│   ├── components/        # Shared components
│   └── layout.tsx         # Root layout
├── lib/                   # Utilities ve store
│   ├── slices/           # Redux slices
│   └── store.ts          # Redux store
├── public/               # Statik dosyalar
└── styles/              # Global stiller
```

## 🔑 Özellikler

### 🏠 Müşteri Arayüzü
- Kategori bazlı yemek listesi
- Sepet yönetimi
- Sipariş oluşturma ve takip
- Adres yönetimi
- Kullanıcı profili

### 👨‍💼 Admin Paneli
- Kategori yönetimi (CRUD işlemleri)
- Yemek yönetimi
- Sipariş takibi
- Kullanıcı yönetimi

## 🛠️ Kurulum

1. Gerekli paketleri yükleyin:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

3. Tarayıcınızda açın:
```
http://localhost:3000
```

## 🔧 Ortam Değişkenleri

`.env.local` dosyasında aşağıdaki değişkenleri tanımlayın:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 📦 Build

Production build için:

```bash
npm run build
npm start
```

## 🧪 Test

```bash
npm run test
```

## 📚 API Kullanımı

Backend API'si ile iletişim için `axios` instance'ı kullanılmaktadır. Tüm API çağrıları `lib/slices` altındaki Redux slice'larında yönetilmektedir.

### Örnek API Kullanımı:

```typescript
// Kategorileri getir
await axios.get(`${API_URL}/categories`)

// Yeni kategori oluştur
await axios.post(`${API_URL}/categories`, data)
```

## 🔐 Yetkilendirme

JWT token bazlı yetkilendirme kullanılmaktadır. Token'lar localStorage'da saklanır ve her API isteğinde Authorization header'ına eklenir.

## 🎨 Stil ve Tasarım

- Ant Design bileşenleri
- Tailwind CSS ile özelleştirme
- Responsive tasarım
- Dark/Light tema desteği

## 📱 Responsive Tasarım

- Mobile-first yaklaşım
- Tablet ve desktop için özelleştirilmiş görünüm
- Dinamik grid sistemi

## 🔄 State Yönetimi

Redux Toolkit ile merkezi state yönetimi:
- User authentication state
- Shopping cart state
- Category & food states
- UI states

## ⚡ Performance

- Image optimization
- Code splitting
- Lazy loading
- Caching strategies

## 🐛 Hata Yönetimi

- Global error boundary
- API error handling
- Form validations
- Loading states

## 👥 Katkıda Bulunma

1. Bu repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

MIT License - daha fazla detay için [LICENSE.md](LICENSE.md) dosyasına bakın.