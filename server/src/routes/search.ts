import express from 'express';
import fetch from 'node-fetch';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { GoogleBooksResponse, BookRecommendation } from '../types/googleBooks';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// Google Books API ile kitap arama
router.get('/books', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { q, maxResults = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Arama terimi gerekli' });
    }

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q as string)}&maxResults=${maxResults}&langRestrict=tr`;
    
    const response = await fetch(apiUrl);
    const data = await response.json() as GoogleBooksResponse;

    if (!data.items) {
      return res.json({ books: [] });
    }

    const books = data.items.map((item) => {
      const volumeInfo = item.volumeInfo;
      return {
        googleId: item.id,
        title: volumeInfo.title || 'Başlık Yok',
        authors: volumeInfo.authors || ['Yazar Bilinmiyor'],
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Yazar Bilinmiyor',
        description: volumeInfo.description || '',
        isbn: volumeInfo.industryIdentifiers?.find((id: any) => 
          id.type === 'ISBN_13' || id.type === 'ISBN_10'
        )?.identifier || '',
        coverImage: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        pageCount: volumeInfo.pageCount || null,
        publishedDate: volumeInfo.publishedDate || '',
        publisher: volumeInfo.publisher || '',
        categories: volumeInfo.categories || [],
        language: volumeInfo.language || 'tr',
        averageRating: volumeInfo.averageRating || null,
        ratingsCount: volumeInfo.ratingsCount || 0
      };
    });

    res.json({ books });
  } catch (error) {
    console.error('Kitap arama hatası:', error);
    res.status(500).json({ error: 'Kitap arama sırasında hata oluştu' });
  }
});

// ISBN ile kitap arama
router.get('/isbn/:isbn', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { isbn } = req.params;

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json() as GoogleBooksResponse;

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    const item = data.items[0];
    const volumeInfo = item.volumeInfo;
    
    const book = {
      googleId: item.id,
      title: volumeInfo.title || 'Başlık Yok',
      authors: volumeInfo.authors || ['Yazar Bilinmiyor'],
      author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Yazar Bilinmiyor',
      description: volumeInfo.description || '',
      isbn: volumeInfo.industryIdentifiers?.find((id: any) => 
        id.type === 'ISBN_13' || id.type === 'ISBN_10'
      )?.identifier || isbn,
      coverImage: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
      pageCount: volumeInfo.pageCount || null,
      publishedDate: volumeInfo.publishedDate || '',
      publisher: volumeInfo.publisher || '',
      categories: volumeInfo.categories || [],
      language: volumeInfo.language || 'tr',
      averageRating: volumeInfo.averageRating || null,
      ratingsCount: volumeInfo.ratingsCount || 0
    };

    res.json({ book });
  } catch (error) {
    console.error('ISBN arama hatası:', error);
    res.status(500).json({ error: 'ISBN arama sırasında hata oluştu' });
  }
});

// Kitap önerileri (kullanıcının okuma geçmişine göre)
router.get('/recommendations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const prisma = new PrismaClient();

    // Kullanıcının en çok okuduğu kategorileri ve yazarları bul
    const userBooks = await prisma.book.findMany({
      where: { 
        userId: req.userId,
        status: 'COMPLETED'
      },
      include: {
        category: true
      }
    });

    if (userBooks.length === 0) {
      return res.json({ recommendations: [] });
    }

    // En çok okunan yazarları bul
    const authorCounts = userBooks.reduce((acc: any, book: any) => {
      acc[book.author] = (acc[book.author] || 0) + 1;
      return acc;
    }, {});

    const topAuthors = Object.entries(authorCounts)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 3)
      .map(([author]) => author);

    // En çok okunan kategorileri bul
    const categoryCounts = userBooks.reduce((acc: any, book: any) => {
      if (book.category) {
        acc[book.category.name] = (acc[book.category.name] || 0) + 1;
      }
      return acc;
    }, {});

    const topCategories = Object.entries(categoryCounts)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Google Books API'den öneriler al
    const recommendations: BookRecommendation[] = [];
    
    // Yazarlara göre öneriler
    for (const author of topAuthors.slice(0, 2)) {
      try {
        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=inauthor:"${encodeURIComponent(author)}"&maxResults=5&langRestrict=tr`;
        const response = await fetch(apiUrl);
        const data = await response.json() as GoogleBooksResponse;
        
        if (data.items) {
          const authorBooks: BookRecommendation[] = data.items.map((item) => {
            const volumeInfo = item.volumeInfo;
            return {
              googleId: item.id,
              title: volumeInfo.title || 'Başlık Yok',
              author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Yazar Bilinmiyor',
              description: volumeInfo.description || '',
              coverImage: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
              pageCount: volumeInfo.pageCount || null,
              categories: volumeInfo.categories || [],
              averageRating: volumeInfo.averageRating || null,
              recommendationType: 'author',
              recommendationReason: `${author} yazarını sevdiğiniz için`
            };
          });
          recommendations.push(...authorBooks);
        }
      } catch (error) {
        console.error(`Yazar önerisi hatası (${author}):`, error);
      }
    }

    // Kategorilere göre öneriler
    for (const category of topCategories.slice(0, 2)) {
      try {
        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=subject:"${encodeURIComponent(category)}"&maxResults=5&langRestrict=tr`;
        const response = await fetch(apiUrl);
        const data = await response.json() as GoogleBooksResponse;
        
        if (data.items) {
          const categoryBooks: BookRecommendation[] = data.items.map((item) => {
            const volumeInfo = item.volumeInfo;
            return {
              googleId: item.id,
              title: volumeInfo.title || 'Başlık Yok',
              author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Yazar Bilinmiyor',
              description: volumeInfo.description || '',
              coverImage: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
              pageCount: volumeInfo.pageCount || null,
              categories: volumeInfo.categories || [],
              averageRating: volumeInfo.averageRating || null,
              recommendationType: 'category',
              recommendationReason: `${category} kategorisini sevdiğiniz için`
            };
          });
          recommendations.push(...categoryBooks);
        }
      } catch (error) {
        console.error(`Kategori önerisi hatası (${category}):`, error);
      }
    }

    // Kullanıcının zaten sahip olduğu kitapları filtrele
    const userBookTitles = userBooks.map(book => book.title.toLowerCase());
    const filteredRecommendations = recommendations.filter(rec => 
      !userBookTitles.includes(rec.title.toLowerCase())
    );

    // Benzersiz önerileri al ve sınırla
    const uniqueRecommendations = filteredRecommendations
      .filter((rec, index, self) => 
        index === self.findIndex(r => r.googleId === rec.googleId)
      )
      .slice(0, 20);

    res.json({ recommendations: uniqueRecommendations });
  } catch (error) {
    console.error('Öneri hatası:', error);
    res.status(500).json({ error: 'Öneri alma sırasında hata oluştu' });
  }
});

export default router;