import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Tüm kategorileri getir
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.userId },
      include: {
        _count: {
          select: { books: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Kategorileri getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni kategori ekle
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Kategori adı gerekli')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, color } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#3B82F6',
        userId: req.userId!
      }
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bu kategori adı zaten mevcut' });
    }
    console.error('Kategori ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kategori güncelle
router.put('/:id', authenticateToken, [
  body('name').notEmpty().withMessage('Kategori adı gerekli')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryId = req.params.id;
    const { name, color } = req.body;

    // Kategorinin kullanıcıya ait olduğunu kontrol et
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: req.userId
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        color: color || existingCategory.color
      }
    });

    res.json(updatedCategory);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bu kategori adı zaten mevcut' });
    }
    console.error('Kategori güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kategori sil
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const categoryId = req.params.id;

    // Kategorinin kullanıcıya ait olduğunu kontrol et
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: req.userId
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    res.json({ message: 'Kategori başarıyla silindi' });
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

export default router;