import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  BookOpenIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  coverImage?: string;
  totalPages?: number;
  currentPage: number;
  status: 'TO_READ' | 'READING' | 'COMPLETED' | 'ABANDONED';
  rating?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  quotes: Quote[];
  tags: Tag[];
}

interface Tag {
  id: string;
  name: string;
}

interface Quote {
  id: string;
  text: string;
  page?: number;
  note?: string;
  createdAt: string;
}

const statusLabels = {
  TO_READ: 'Okunacak',
  READING: 'Okunuyor',
  COMPLETED: 'Okundu',
  ABANDONED: 'Yarım Kaldı'
};

const statusColors = {
  TO_READ: 'bg-gray-100 text-gray-800',
  READING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ABANDONED: 'bg-red-100 text-red-800'
};

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [newQuote, setNewQuote] = useState({ text: '', page: '', note: '' });
  const [showTagForm, setShowTagForm] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookResponse = await api.get(`/books/${id}`);
        setBook(bookResponse.data);
        
        // Mevcut etiketleri yükle
        const tagsResponse = await api.get('/tags');
        setAvailableTags(tagsResponse.data);
      } catch (error) {
        console.error('Kitap detayı yüklenirken hata:', error);
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!book) return;

    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'READING' && !book.startDate) {
        updateData.startDate = new Date().toISOString();
      } else if (newStatus === 'COMPLETED' && !book.endDate) {
        updateData.endDate = new Date().toISOString();
      }

      const response = await api.put(`/books/${book.id}`, updateData);
      setBook(response.data);
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
    }
  };

  const handleProgressUpdate = async (currentPage: number) => {
    if (!book) return;

    try {
      const response = await api.put(`/books/${book.id}`, { currentPage });
      setBook(response.data);
    } catch (error) {
      console.error('İlerleme güncellenirken hata:', error);
    }
  };

  const handleRatingUpdate = async (rating: number) => {
    if (!book) return;

    try {
      const response = await api.put(`/books/${book.id}`, { rating });
      setBook(response.data);
    } catch (error) {
      console.error('Değerlendirme güncellenirken hata:', error);
    }
  };

  const handleDeleteBook = async () => {
    if (!book || !confirm('Bu kitabı silmek istediğinizden emin misiniz?')) return;

    try {
      await api.delete(`/books/${book.id}`);
      navigate('/books');
    } catch (error) {
      console.error('Kitap silinirken hata:', error);
    }
  };

  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !newQuote.text.trim()) return;

    try {
      const response = await api.post('/quotes', {
        text: newQuote.text,
        page: newQuote.page ? parseInt(newQuote.page) : null,
        note: newQuote.note || null,
        bookId: book.id
      });

      setBook({
        ...book,
        quotes: [...book.quotes, response.data]
      });

      setNewQuote({ text: '', page: '', note: '' });
      setShowQuoteForm(false);
    } catch (error) {
      console.error('Alıntı eklenirken hata:', error);
    }
  };
  
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !selectedTagId) return;

    try {
      const response = await api.post(`/books/${book.id}/tags`, {
        tagId: selectedTagId
      });

      // Kitap nesnesini güncelle
      setBook({
        ...book,
        tags: [...book.tags, response.data]
      });

      setSelectedTagId('');
      setShowTagForm(false);
    } catch (error) {
      console.error('Etiket eklenirken hata:', error);
    }
  };
  
  const handleRemoveTag = async (tagId: string) => {
    if (!book) return;
    
    try {
      await api.delete(`/books/${book.id}/tags/${tagId}`);
      
      // Kitap nesnesinden etiketi kaldır
      setBook({
        ...book,
        tags: book.tags.filter(tag => tag.id !== tagId)
      });
    } catch (error) {
      console.error('Etiket kaldırılırken hata:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Kitap bulunamadı</h3>
        <Link to="/books" className="btn-primary">
          Kitaplara Dön
        </Link>
      </div>
    );
  }

  const progressPercentage = book.totalPages ? Math.min((book.currentPage / book.totalPages) * 100, 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/books')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Kitaplara Dön
        </button>
        
        <div className="flex space-x-2">
          <Link
            to={`/books/${book.id}/edit`}
            className="btn-secondary flex items-center"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Düzenle
          </Link>
          <button
            onClick={handleDeleteBook}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Sil
          </button>
        </div>
      </div>

      {/* Book Info */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full max-w-sm mx-auto rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full max-w-sm mx-auto h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{book.author}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[book.status]}`}>
                  {statusLabels[book.status]}
                </span>
                {book.category && (
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: book.category.color }}
                  >
                    {book.category.name}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm font-medium text-gray-700">Değerlendirme:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingUpdate(star)}
                      className="focus:outline-none"
                    >
                      {star <= (book.rating || 0) ? (
                        <StarIconSolid className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <StarIcon className="w-5 h-5 text-gray-300 hover:text-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress */}
              {book.totalPages && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">İlerleme</span>
                    <span className="text-sm text-gray-600">
                      {book.currentPage} / {book.totalPages} sayfa (%{Math.round(progressPercentage)})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="0"
                      max={book.totalPages}
                      value={book.currentPage}
                      onChange={(e) => handleProgressUpdate(parseInt(e.target.value) || 0)}
                      className="input-field w-24"
                    />
                    <span className="text-sm text-gray-600 self-center">sayfa</span>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700 block mb-2">Durum Güncelle:</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        book.status === status
                          ? statusColors[status as keyof typeof statusColors]
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Book Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {book.isbn && (
                  <div>
                    <span className="font-medium text-gray-700">ISBN:</span>
                    <span className="ml-2 text-gray-600">{book.isbn}</span>
                  </div>
                )}
                {book.startDate && (
                  <div>
                    <span className="font-medium text-gray-700">Başlangıç:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(book.startDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
                {book.endDate && (
                  <div>
                    <span className="font-medium text-gray-700">Bitiş:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(book.endDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {book.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Açıklama</h3>
            <p className="text-gray-600 leading-relaxed">{book.description}</p>
          </div>
        )}
      </div>

      {/* Tags Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <TagIcon className="w-6 h-6 mr-2" />
            Etiketler
          </h2>
          <button
            onClick={() => setShowTagForm(!showTagForm)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Etiket Ekle
          </button>
        </div>
        
        {showTagForm && (
          <form onSubmit={handleAddTag} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiket Seç *
                </label>
                <select
                  value={selectedTagId}
                  onChange={(e) => setSelectedTagId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Etiket seçin</option>
                  {availableTags
                    .filter(tag => !book.tags.some(bookTag => bookTag.id === tag.id))
                    .map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTagForm(false)}
                  className="btn-secondary"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={!selectedTagId}
                >
                  Ekle
                </button>
              </div>
            </div>
          </form>
        )}

        {book.tags.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Henüz etiket eklenmemiş
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {book.tags.map((tag) => (
              <div key={tag.id} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1">
                <span className="mr-1">{tag.name}</span>
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Quotes Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" />
            Alıntılar ({book.quotes.length})
          </h2>
          <button
            onClick={() => setShowQuoteForm(!showQuoteForm)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Alıntı Ekle
          </button>
        </div>

        {showQuoteForm && (
          <form onSubmit={handleAddQuote} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alıntı Metni *
                </label>
                <textarea
                  value={newQuote.text}
                  onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sayfa
                  </label>
                  <input
                    type="number"
                    value={newQuote.page}
                    onChange={(e) => setNewQuote({ ...newQuote, page: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Not
                  </label>
                  <input
                    type="text"
                    value={newQuote.note}
                    onChange={(e) => setNewQuote({ ...newQuote, note: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteForm(false)}
                  className="btn-secondary"
                >
                  İptal
                </button>
                <button type="submit" className="btn-primary">
                  Ekle
                </button>
              </div>
            </div>
          </form>
        )}

        {book.quotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Henüz alıntı eklenmemiş
          </div>
        ) : (
          <div className="space-y-4">
            {book.quotes.map((quote) => (
              <div key={quote.id} className="border border-gray-200 rounded-lg p-4">
                <blockquote className="text-gray-800 italic mb-2">
                  "{quote.text}"
                </blockquote>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex space-x-4">
                    {quote.page && <span>Sayfa {quote.page}</span>}
                    {quote.note && <span>• {quote.note}</span>}
                  </div>
                  <span>{new Date(quote.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;