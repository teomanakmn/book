import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Kitaba etiket ekle
router.post('/:bookId/tags', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { bookId } = req.params;
    const { tagId } = req.body;
    
    if (!tagId) {
      return res.status(400).json({ error: 'Etiket ID gerekli' });
    }
    
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
    
    // Etiketin var olup olmadığını kontrol et
    const tag = await prisma.tag.findUnique({
      where: {
        id: tagId
      }
    });
    
    if (!tag) {
      return res.status(404).json({ error: 'Etiket bulunamadı' });
    }
    
    // Etiket zaten eklenmiş mi kontrol et
    const existingBookTag = await prisma.bookTag.findUnique({
      where: {
        bookId_tagId: {
          bookId,
          tagId
        }
      }
    });
    
    if (existingBookTag) {
      return res.status(400).json({ error: 'Bu etiket zaten kitaba eklenmiş' });
    }
    
    // Kitaba etiketi ekle
    await prisma.bookTag.create({
      data: {
        bookId,
        tagId
      }
    });
    
    res.status(201).json(tag);
  } catch (error) {
    console.error('Etiket eklenirken hata:', error);
    res.status(500).json({ error: 'Etiket eklenirken bir hata oluştu' });
  }
});

// Kitaptan etiket kaldır
router.delete('/:bookId/tags/:tagId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { bookId, tagId } = req.params;
    
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
    
    // Kitap-etiket ilişkisini bul
    const bookTag = await prisma.bookTag.findUnique({
      where: {
        bookId_tagId: {
          bookId,
          tagId
        }
      }
    });
    
    if (!bookTag) {
      return res.status(404).json({ error: 'Bu kitapta böyle bir etiket yok' });
    }
    
    // Kitap-etiket ilişkisini sil
    await prisma.bookTag.delete({
      where: {
        bookId_tagId: {
          bookId,
          tagId
        }
      }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Etiket kaldırılırken hata:', error);
    res.status(500).json({ error: 'Etiket kaldırılırken bir hata oluştu' });
  }
});

export default router;