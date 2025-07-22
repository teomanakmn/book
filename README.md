# Kitap Kayıt Uygulaması - Render.com Deployment Guide

Bu rehber, Kitap Kayıt uygulamasını Render.com üzerinde nasıl deploy edeceğinizi açıklar.

## Ön Gereksinimler

- Render.com hesabı
- Google Books API anahtarı
- Git repo'su

## Render.com Dashboard Üzerinden Deployment

### 1. PostgreSQL Veritabanı Oluşturma

1. Render.com dashboard'da "New +" butonuna tıklayın
2. "PostgreSQL" seçeneğini seçin
3. Veritabanı bilgilerini doldurun:
   - Name: `kitapkayit-db`
   - Database: `kitapkayit`
   - User: Otomatik oluşturulacak
   - Region: Size en yakın bölgeyi seçin
4. "Create Database" butonuna tıklayın

### 2. Backend Web Service Oluşturma

1. Render.com dashboard'da "New +" butonuna tıklayın
2. "Web Service" seçeneğini seçin
3. GitHub repo'nuzu bağlayın
4. Servis bilgilerini doldurun:
   - Name: `kitapkayit-api`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
   - Region: Size en yakın bölgeyi seçin
5. "Environment Variables" bölümünde aşağıdaki değişkenleri ekleyin:
   - `DATABASE_URL`: PostgreSQL veritabanınızın URL'i
   - `JWT_SECRET`: Güçlü bir rastgele string
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `GOOGLE_BOOKS_API_KEY`: Google Books API anahtarınız
6. "Create Web Service" butonuna tıklayın

### 3. Frontend Static Site Oluşturma

1. Render.com dashboard'da "New +" butonuna tıklayın
2. "Static Site" seçeneğini seçin
3. GitHub repo'nuzu bağlayın
4. Servis bilgilerini doldurun:
   - Name: `kitapkayit`
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Region: Size en yakın bölgeyi seçin
5. "Environment Variables" bölümünde aşağıdaki değişkenleri ekleyin:
   - `VITE_API_URL`: Backend'inizin URL'i (örn: `https://kitapkayit-api.onrender.com/api`)
6. "Create Static Site" butonuna tıklayın

## Render.com Blueprint ile Deployment (Alternatif)

Render.com Blueprint kullanarak tek bir adımda tüm servisleri oluşturabilirsiniz:

1. Render.com dashboard'da "New +" butonuna tıklayın
2. "Blueprint" seçeneğini seçin
3. GitHub repo'nuzu bağlayın
4. `render.yaml` dosyasının otomatik olarak algılanmasını bekleyin
5. "Apply" butonuna tıklayın
6. Gerekli çevre değişkenlerini doldurun:
   - `GOOGLE_BOOKS_API_KEY`: Google Books API anahtarınız
7. "Create Resources" butonuna tıklayın

## Önemli Notlar

- Üretim ortamında güçlü ve benzersiz bir JWT_SECRET kullanın
- CORS ayarlarını frontend'inizin domain'ini içerecek şekilde güncelleyin
- Google Books API anahtarınızı oluşturun ve backend'e ekleyin
- Veritabanı bağlantı URL'inizin doğru olduğundan emin olun