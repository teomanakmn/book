import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Tüm kitapları getir
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const books = await prisma.book.findMany({
      where: { userId: req.userId },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        quotes: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(books);
  } catch (error) {
    console.error('Kitapları getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kitap detayını getir
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const book = await prisma.book.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        quotes: true
      }
    });

    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    res.json(book);
  } catch (error) {
    console.error('Kitap detayı getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni kitap ekle
router.post('/', authenticateToken, [
  body('title').notEmpty().withMessage('Kitap başlığı gerekli'),
  body('author').notEmpty().withMessage('Yazar gerekli')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      author,
      isbn,
      description,
      coverImage,
      totalPages,
      categoryId,
      tags
    } = req.body;

    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn,
        description,
        coverImage,
        totalPages: totalPages ? parseInt(totalPages) : null,
        userId: req.userId!,
        categoryId: categoryId || null
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    // Etiketleri ekle
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        // Etiketi bul veya oluştur
        let tag = await prisma.tag.findUnique({
          where: { name: tagName }
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName }
          });
        }

        // Kitap-etiket ilişkisini oluştur
        await prisma.bookTag.create({
          data: {
            bookId: book.id,
            tagId: tag.id
          }
        });
      }
    }

    res.status(201).json(book);
  } catch (error) {
    console.error('Kitap ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kitap güncelle
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const bookId = req.params.id;
    const {
      title,
      author,
      isbn,
      description,
      coverImage,
      totalPages,
      currentPage,
      status,
      rating,
      startDate,
      endDate,
      categoryId
    } = req.body;

    // Kitabın kullanıcıya ait olduğunu kontrol et
    const existingBook = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!existingBook) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        title,
        author,
        isbn,
        description,
        coverImage,
        totalPages: totalPages ? parseInt(totalPages) : null,
        currentPage: currentPage ? parseInt(currentPage) : 0,
        status,
        rating: rating ? parseInt(rating) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        categoryId: categoryId || null
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.json(updatedBook);
  } catch (error) {
    console.error('Kitap güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kitap sil
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const bookId = req.params.id;

    // Kitabın kullanıcıya ait olduğunu kontrol et
    const existingBook = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!existingBook) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    await prisma.book.delete({
      where: { id: bookId }
    });

    res.json({ message: 'Kitap başarıyla silindi' });
  } catch (error) {
    console.error('Kitap silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

export default router;