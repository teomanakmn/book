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

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 10000;

// Middleware
// CORS ayarları - Render.com frontend domain'ini ekleyin
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://kitapkayit.onrender.com'] // Render.com frontend domain'inizi buraya ekleyin
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // origin olmayan isteklere izin ver (örn. Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('combined'));

// Routes
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
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Netlify Functions için export
export default app;