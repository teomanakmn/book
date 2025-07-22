import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Routes
import authRoutes from './routes/auth';
import bookRoutes from './routes/books';
import categoryRoutes from './routes/categories';
import quoteRoutes from './routes/quotes';
import statsRoutes from './routes/stats';
import searchRoutes from './routes/search';
import tagRoutes from './routes/tags';
import bookTagRoutes from './routes/bookTags';
import healthRoutes from './routes/health';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 10000;

// Veritabanı bağlantısını test et
prisma.$connect()
  .then(() => {
    console.log('✅ Veritabanı bağlantısı başarılı');
  })
  .catch((error) => {
    console.error('❌ Veritabanı bağlantı hatası:', error);
  });

// Middleware
// CORS ayarları - Render.com frontend domain'ini ekleyin
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://kitap-app-frontend.onrender.com', 'https://kitapkayit.onrender.com'] // Render.com frontend domain'leri
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

// Geliştirme aşamasında daha esnek CORS ayarları
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: function (origin, callback) {
      // origin olmayan isteklere izin ver (örn. Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || origin?.includes('render.com')) {
        callback(null, true);
      } else {
        console.log('CORS blocked:', origin);
        callback(new Error('CORS policy violation'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
} else {
  // Geliştirme ortamında tüm origin'lere izin ver
  app.use(cors({
    origin: true,
    credentials: true
  }));
}
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/books', bookTagRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kitap Kayıt API çalışıyor!' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Bir şeyler yanlış gitti!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📚 Kitap Kayıt API hazır!`);
});

// Graceful shutdown
// TypeScript hatası nedeniyle process.on kullanımını kaldırdık
// Render'da bu kod zaten çalışmayacak
try {
  // @ts-ignore
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
} catch (error) {
  console.log('Process event listener error:', error);
}

// Netlify Functions için export
export default app;