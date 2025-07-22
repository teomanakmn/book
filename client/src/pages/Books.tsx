import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PlusIcon, BookOpenIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  status: 'TO_READ' | 'READING' | 'COMPLETED' | 'ABANDONED';
  currentPage: number;
  totalPages?: number;
  category?: {
    name: string;
    color: string;
  };
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

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categories, setCategories] = useState<{id: string, name: string, color: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksResponse, categoriesResponse] = await Promise.all([
          api.get('/books'),
          api.get('/categories')
        ]);
        
        setBooks(booksResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredBooks = books
    .filter(book => filter === 'ALL' || book.status === filter)
    .filter(book => !categoryFilter || book.category?.id === categoryFilter)
    .filter(book => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.isbn?.toLowerCase().includes(term) ||
        book.description?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'progress':
          const aProgress = a.totalPages ? (a.currentPage / a.totalPages) : 0;
          const bProgress = b.totalPages ? (b.currentPage / b.totalPages) : 0;
          comparison = aProgress - bProgress;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Kitaplar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kitaplarım</h1>
        <Link to="/add-book" className="btn-primary flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Kitap Ekle
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Kitap ara..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex space-x-2">
            <select
              className="input-field flex-1"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              className="input-field flex-1"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
            >
              <option value="title-asc">İsim (A-Z)</option>
              <option value="title-desc">İsim (Z-A)</option>
              <option value="author-asc">Yazar (A-Z)</option>
              <option value="author-desc">Yazar (Z-A)</option>
              <option value="date-desc">Eklenme (Yeni-Eski)</option>
              <option value="date-asc">Eklenme (Eski-Yeni)</option>
              <option value="rating-desc">Puan (Yüksek-Düşük)</option>
              <option value="rating-asc">Puan (Düşük-Yüksek)</option>
              <option value="progress-desc">İlerleme (Çok-Az)</option>
              <option value="progress-asc">İlerleme (Az-Çok)</option>
            </select>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {[
            { key: 'ALL', label: 'Tümü' },
            { key: 'TO_READ', label: 'Okunacak' },
            { key: 'READING', label: 'Okunuyor' },
            { key: 'COMPLETED', label: 'Okundu' },
            { key: 'ABANDONED', label: 'Yarım Kaldı' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                filter === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'ALL' ? 'Henüz kitap eklenmemiş' : 'Bu kategoride kitap yok'}
          </h3>
          <p className="text-gray-600 mb-4">
            İlk kitabınızı ekleyerek başlayın!
          </p>
          <Link to="/add-book" className="btn-primary">
            Kitap Ekle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="aspect-w-3 aspect-h-4 mb-4">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <BookOpenIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600">{book.author}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[book.status]}`}>
                    {statusLabels[book.status]}
                  </span>
                  {book.category && (
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: book.category.color }}
                    >
                      {book.category.name}
                    </span>
                  )}
                </div>
                
                {book.totalPages && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((book.currentPage / book.totalPages) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Books;