import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Tüm alıntıları getir
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { userId: req.userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(quotes);
  } catch (error) {
    console.error('Alıntıları getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Belirli bir kitabın alıntılarını getir
router.get('/book/:bookId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { bookId } = req.params;

    // Kitabın kullanıcıya ait olduğunu kontrol et
    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    const quotes = await prisma.quote.findMany({
      where: {
        bookId,
        userId: req.userId
      },
      orderBy: { page: 'asc' }
    });

    res.json(quotes);
  } catch (error) {
    console.error('Kitap alıntılarını getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni alıntı ekle
router.post('/', authenticateToken, [
  body('text').notEmpty().withMessage('Alıntı metni gerekli'),
  body('bookId').notEmpty().withMessage('Kitap ID gerekli')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, bookId, page, note } = req.body;

    // Kitabın kullanıcıya ait olduğunu kontrol et
    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    const quote = await prisma.quote.create({
      data: {
        text,
        page: page ? parseInt(page) : null,
        note,
        bookId,
        userId: req.userId!
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true
          }
        }
      }
    });

    res.status(201).json(quote);
  } catch (error) {
    console.error('Alıntı ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Alıntı güncelle
router.put('/:id', authenticateToken, [
  body('text').notEmpty().withMessage('Alıntı metni gerekli')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const quoteId = req.params.id;
    const { text, page, note } = req.body;

    // Alıntının kullanıcıya ait olduğunu kontrol et
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId: req.userId
      }
    });

    if (!existingQuote) {
      return res.status(404).json({ error: 'Alıntı bulunamadı' });
    }

    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        text,
        page: page ? parseInt(page) : null,
        note
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true
          }
        }
      }
    });

    res.json(updatedQuote);
  } catch (error) {
    console.error('Alıntı güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Alıntı sil
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const quoteId = req.params.id;

    // Alıntının kullanıcıya ait olduğunu kontrol et
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId: req.userId
      }
    });

    if (!existingQuote) {
      return res.status(404).json({ error: 'Alıntı bulunamadı' });
    }

    await prisma.quote.delete({
      where: { id: quoteId }
    });

    res.json({ message: 'Alıntı başarıyla silindi' });
  } catch (error) {
    console.error('Alıntı silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

export default router;