import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Quote {
  id: string;
  text: string;
  page?: number;
  note?: string;
  createdAt: string;
  book: {
    id: string;
    title: string;
    author: string;
    coverImage?: string;
  };
}

const Quotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookFilter, setBookFilter] = useState('');
  const [books, setBooks] = useState<{id: string, title: string}[]>([]);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editForm, setEditForm] = useState({
    text: '',
    page: '',
    note: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quotesResponse, booksResponse] = await Promise.all([
          api.get('/quotes'),
          api.get('/books')
        ]);
        
        setQuotes(quotesResponse.data);
        setBooks(booksResponse.data.map((book: any) => ({
          id: book.id,
          title: book.title
        })));
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = quotes;
    
    // Arama terimine göre filtrele
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(quote =>
        quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.note?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Kitaba göre filtrele
    if (bookFilter) {
      filtered = filtered.filter(quote => quote.book.id === bookFilter);
    }
    
    setFilteredQuotes(filtered);
  }, [quotes, searchTerm, bookFilter]);

  const fetchQuotes = async () => {
    try {
      const response = await api.get('/quotes');
      setQuotes(response.data);
    } catch (error) {
      console.error('Alıntılar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setEditForm({
      text: quote.text,
      page: quote.page?.toString() || '',
      note: quote.note || ''
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;

    try {
      const response = await api.put(`/quotes/${editingQuote.id}`, {
        text: editForm.text,
        page: editForm.page ? parseInt(editForm.page) : null,
        note: editForm.note || null
      });

      setQuotes(quotes.map(quote =>
        quote.id === editingQuote.id ? response.data : quote
      ));
      
      setEditingQuote(null);
      setEditForm({ text: '', page: '', note: '' });
    } catch (error) {
      console.error('Alıntı güncellenirken hata:', error);
    }
  };

  const handleDelete = async (quoteId: string) => {
    if (!confirm('Bu alıntıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/quotes/${quoteId}`);
      setQuotes(quotes.filter(quote => quote.id !== quoteId));
    } catch (error) {
      console.error('Alıntı silinirken hata:', error);
    }
  };

  const cancelEdit = () => {
    setEditingQuote(null);
    setEditForm({ text: '', page: '', note: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Alıntılar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Alıntılar</h1>
        <div className="text-sm text-gray-600">
          {quotes.length} alıntı
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Alıntılarda ara..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="input-field"
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
            >
              <option value="">Tüm Kitaplar</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editingQuote && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alıntı Düzenle</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alıntı Metni *
              </label>
              <textarea
                value={editForm.text}
                onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
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
                  value={editForm.page}
                  onChange={(e) => setEditForm({ ...editForm, page: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Not
                </label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="btn-secondary"
              >
                İptal
              </button>
              <button type="submit" className="btn-primary">
                Güncelle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz alıntı eklenmemiş'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Farklı anahtar kelimeler deneyin'
              : 'Kitap detay sayfalarından alıntı ekleyebilirsiniz'
            }
          </p>
          {!searchTerm && (
            <Link to="/books" className="btn-primary">
              Kitaplara Git
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <div key={quote.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <Link
                  to={`/books/${quote.book.id}`}
                  className="flex items-center space-x-3 hover:text-blue-600 transition-colors"
                >
                  {quote.book.coverImage ? (
                    <img
                      src={quote.book.coverImage}
                      alt={quote.book.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <BookOpenIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{quote.book.title}</h3>
                    <p className="text-sm text-gray-600">{quote.book.author}</p>
                  </div>
                </Link>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(quote)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(quote.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <blockquote className="text-gray-800 italic text-lg leading-relaxed mb-4 pl-4 border-l-4 border-blue-200">
                "{quote.text}"
              </blockquote>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex space-x-4">
                  {quote.page && (
                    <span className="flex items-center">
                      <BookOpenIcon className="w-4 h-4 mr-1" />
                      Sayfa {quote.page}
                    </span>
                  )}
                  {quote.note && (
                    <span className="flex items-center">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                      {quote.note}
                    </span>
                  )}
                </div>
                <span>{new Date(quote.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Stats */}
      {quotes.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alıntı İstatistikleri</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {quotes.length}
              </div>
              <div className="text-sm text-gray-600">Toplam Alıntı</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(quotes.map(q => q.book.id)).size}
              </div>
              <div className="text-sm text-gray-600">Alıntılı Kitap</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {quotes.filter(q => q.note).length}
              </div>
              <div className="text-sm text-gray-600">Notlu Alıntı</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotes;