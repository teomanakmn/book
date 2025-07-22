import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Tüm etiketleri getir
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            books: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json(tags);
  } catch (error) {
    console.error('Etiketler getirilirken hata:', error);
    res.status(500).json({ error: 'Etiketler getirilirken bir hata oluştu' });
  }
});

// Yeni etiket oluştur
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Etiket adı gerekli' });
    }
    
    // Aynı isimde etiket var mı kontrol et
    const existingTag = await prisma.tag.findUnique({
      where: {
        name
      }
    });
    
    if (existingTag) {
      return res.status(400).json({ error: 'Bu isimde bir etiket zaten var' });
    }
    
    const tag = await prisma.tag.create({
      data: {
        name
      }
    });
    
    res.status(201).json(tag);
  } catch (error) {
    console.error('Etiket oluşturulurken hata:', error);
    res.status(500).json({ error: 'Etiket oluşturulurken bir hata oluştu' });
  }
});

// Etiket güncelle
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Etiket adı gerekli' });
    }
    
    // Etiketin var olup olmadığını kontrol et
    const existingTag = await prisma.tag.findUnique({
      where: {
        id
      }
    });
    
    if (!existingTag) {
      return res.status(404).json({ error: 'Etiket bulunamadı' });
    }
    
    // Aynı isimde başka bir etiket var mı kontrol et
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        name,
        id: {
          not: id
        }
      }
    });
    
    if (duplicateTag) {
      return res.status(400).json({ error: 'Bu isimde bir etiket zaten var' });
    }
    
    const updatedTag = await prisma.tag.update({
      where: {
        id
      },
      data: {
        name
      },
      include: {
        _count: {
          select: {
            books: true
          }
        }
      }
    });
    
    res.json(updatedTag);
  } catch (error) {
    console.error('Etiket güncellenirken hata:', error);
    res.status(500).json({ error: 'Etiket güncellenirken bir hata oluştu' });
  }
});

// Etiket sil
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Etiketin var olup olmadığını kontrol et
    const existingTag = await prisma.tag.findUnique({
      where: {
        id
      }
    });
    
    if (!existingTag) {
      return res.status(404).json({ error: 'Etiket bulunamadı' });
    }
    
    // Etiketi sil
    await prisma.tag.delete({
      where: {
        id
      }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Etiket silinirken hata:', error);
    res.status(500).json({ error: 'Etiket silinirken bir hata oluştu' });
  }
});

export default router;