import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Sağlık kontrolü endpoint'i
router.get('/', async (req, res) => {
  try {
    // Veritabanı bağlantısını test et
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date(),
      database: 'disconnected',
      error: errorMessage,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

export default router;