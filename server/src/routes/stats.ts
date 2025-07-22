import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// İstatistikleri getir
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    // Temel istatistikler
    const totalBooks = await prisma.book.count({
      where: { userId }
    });

    const completedBooks = await prisma.book.count({
      where: {
        userId,
        status: 'COMPLETED'
      }
    });

    const currentlyReading = await prisma.book.count({
      where: {
        userId,
        status: 'READING'
      }
    });

    const toReadBooks = await prisma.book.count({
      where: {
        userId,
        status: 'TO_READ'
      }
    });

    const totalQuotes = await prisma.quote.count({
      where: { userId }
    });

    // Kategorilere göre kitap dağılımı
    const booksByCategory = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { books: true }
        }
      }
    });

    // Aylık okuma istatistikleri (son 12 ay)
    const monthlyStats = await prisma.book.groupBy({
      by: ['endDate'],
      where: {
        userId,
        status: 'COMPLETED',
        endDate: {
          gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        }
      },
      _count: {
        id: true
      }
    });

    // Ortalama sayfa sayısı
    const avgPages = await prisma.book.aggregate({
      where: {
        userId,
        totalPages: {
          not: null
        }
      },
      _avg: {
        totalPages: true
      }
    });

    // En çok okunan yazarlar
    const topAuthors = await prisma.book.groupBy({
      by: ['author'],
      where: {
        userId,
        status: 'COMPLETED'
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    // Okuma hızı (son tamamlanan kitaplar)
    const recentCompletedBooks = await prisma.book.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        startDate: { not: null },
        endDate: { not: null },
        totalPages: { not: null }
      },
      orderBy: { endDate: 'desc' },
      take: 10
    });

    let avgReadingSpeed = 0;
    if (recentCompletedBooks.length > 0) {
      const totalDays = recentCompletedBooks.reduce((sum, book) => {
        const days = Math.ceil(
          (new Date(book.endDate!).getTime() - new Date(book.startDate!).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      
      const totalPages = recentCompletedBooks.reduce((sum, book) => sum + (book.totalPages || 0), 0);
      avgReadingSpeed = Math.round(totalPages / totalDays);
    }

    res.json({
      overview: {
        totalBooks,
        completedBooks,
        currentlyReading,
        toReadBooks,
        totalQuotes,
        avgPages: Math.round(avgPages._avg.totalPages || 0),
        avgReadingSpeed
      },
      booksByCategory: booksByCategory.map(cat => ({
        name: cat.name,
        count: cat._count.books,
        color: cat.color
      })),
      monthlyStats,
      topAuthors: topAuthors.map(author => ({
        name: author.author,
        count: author._count.id
      }))
    });
  } catch (error) {
    console.error('İstatistikleri getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

export default router;