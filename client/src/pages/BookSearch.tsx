import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  PlusIcon,
  StarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface SearchResult {
  googleId: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  pageCount?: number;
  isbn: string;
  categories: string[];
  averageRating?: number;
  ratingsCount: number;
  recommendationType?: string;
  recommendationReason?: string;
}

const BookSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recommendations, setRecommendations] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'recommendations'>('search');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      const response = await api.get('/search/recommendations');
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Öneriler yüklenirken hata:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await api.get(`/search/books?q=${encodeURIComponent(searchTerm)}&maxResults=20`);
      setSearchResults(response.data.books);
      setActiveTab('search');
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState<SearchResult | null>(null);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
      }
    };
    
    fetchCategories();
  }, []);

  const handleAddBook = async (book: SearchResult) => {
    setSelectedBook(book);
    setShowAddForm(true);
  };
  
  const handleConfirmAdd = async () => {
    if (!selectedBook) return;
    
    try {
      const bookData = {
        title: selectedBook.title,
        author: selectedBook.author,
        isbn: selectedBook.isbn,
        description: selectedBook.description,
        coverImage: selectedBook.coverImage,
        totalPages: selectedBook.pageCount,
        categoryId: selectedCategory || null
      };

      await api.post('/books', bookData);
      navigate('/books');
    } catch (error) {
      console.error('Kitap eklenirken hata:', error);
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= Math.round(rating) ? (
            <StarIconSolid key={star} className="w-4 h-4 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="w-4 h-4 text-gray-300" />
          )
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const renderBookCard = (book: SearchResult, showRecommendationReason = false) => (
    <div key={book.googleId} className="card hover:shadow-lg transition-shadow">
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-20 h-28 object-cover rounded"
            />
          ) : (
            <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center">
              <BookOpenIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600 mb-1">{book.author}</p>
              {renderStars(book.averageRating)}
            </div>
            
            <button
              onClick={() => handleAddBook(book)}
              className="btn-primary flex items-center ml-4"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Ekle
            </button>
          </div>

          {showRecommendationReason && book.recommendationReason && (
            <div className="mb-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
              <SparklesIcon className="w-4 h-4 inline mr-1" />
              {book.recommendationReason}
            </div>
          )}

          {book.description && (
            <p className="text-sm text-gray-600 line-clamp-3 mb-2">
              {book.description.replace(/<[^>]*>/g, '')}
            </p>
          )}

          <div className="flex flex-wrap gap-2 text-xs">
            {book.pageCount && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {book.pageCount} sayfa
              </span>
            )}
            {book.categories.slice(0, 2).map((category, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 rounded">
                {category}
              </span>
            ))}
            {book.ratingsCount > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded">
                {book.ratingsCount} değerlendirme
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kitap Ara</h1>
        <p className="text-gray-600">Google Books'tan kitap arayın ve kütüphanenize ekleyin</p>
      </div>

      {/* Search Form */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Kitap adı, yazar, ISBN..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>
        </form>
      </div>
      
      {/* Add Book Form */}
      {showAddForm && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Kitap Ekle</h2>
            
            <div className="flex mb-4">
              {selectedBook.coverImage ? (
                <img 
                  src={selectedBook.coverImage} 
                  alt={selectedBook.title}
                  className="w-20 h-28 object-cover rounded mr-4" 
                />
              ) : (
                <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center mr-4">
                  <BookOpenIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <div>
                <h3 className="font-semibold">{selectedBook.title}</h3>
                <p className="text-sm text-gray-600">{selectedBook.author}</p>
                {selectedBook.pageCount && (
                  <p className="text-sm text-gray-600">{selectedBook.pageCount} sayfa</p>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori (opsiyonel)
              </label>
              <select
                className="input-field"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Kategori seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedBook(null);
                  setSelectedCategory('');
                }}
                className="btn-secondary"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmAdd}
                className="btn-primary"
              >
                Kitabı Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Arama Sonuçları ({searchResults.length})
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <SparklesIcon className="w-4 h-4 inline mr-1" />
          Öneriler ({recommendations.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'search' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-gray-600">Aranıyor...</div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Sonuç bulunamadı' : 'Kitap aramaya başlayın'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Farklı anahtar kelimeler deneyin'
                  : 'Yukarıdaki arama kutusunu kullanarak kitap arayabilirsiniz'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((book) => renderBookCard(book))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div>
          {recommendationsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-gray-600">Öneriler yükleniyor...</div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12">
              <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz öneri yok
              </h3>
              <p className="text-gray-600 mb-4">
                Kişiselleştirilmiş öneriler almak için birkaç kitap okuyun ve tamamlayın
              </p>
              <button
                onClick={() => navigate('/books')}
                className="btn-primary"
              >
                Kitaplarıma Git
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((book) => renderBookCard(book, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookSearch;