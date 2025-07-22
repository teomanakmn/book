import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

interface Category {
  id: string;
  name: string;
  color: string;
}

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
  categoryId?: string;
}

const EditBook = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Kitap ve kategorileri paralel olarak yükle
        const [bookResponse, categoriesResponse] = await Promise.all([
          api.get(`/books/${id}`),
          api.get('/categories')
        ]);
        
        setFormData(bookResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
        setError('Kitap bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setSaving(true);
    try {
      await api.put(`/books/${id}`, {
        ...formData,
        totalPages: formData.totalPages ? parseInt(String(formData.totalPages)) : null,
        categoryId: formData.categoryId || null
      });
      navigate(`/books/${id}`);
    } catch (error) {
      console.error('Kitap güncellenirken hata:', error);
      setError('Kitap güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{error || 'Kitap bulunamadı'}</h3>
        <button
          onClick={() => navigate('/books')}
          className="btn-primary"
        >
          Kitaplara Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kitap Düzenle</h1>
      
      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Kitap Başlığı *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="input-field"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Yazar *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              required
              className="input-field"
              value={formData.author}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
              ISBN
            </label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              className="input-field"
              value={formData.isbn || ''}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="totalPages" className="block text-sm font-medium text-gray-700 mb-2">
              Toplam Sayfa
            </label>
            <input
              type="number"
              id="totalPages"
              name="totalPages"
              className="input-field"
              value={formData.totalPages || ''}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className="input-field"
              value={formData.categoryId || ''}
              onChange={handleChange}
            >
              <option value="">Kategori seçin</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
              Kapak Resmi URL
            </label>
            <input
              type="url"
              id="coverImage"
              name="coverImage"
              className="input-field"
              value={formData.coverImage || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Açıklama
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="input-field"
            value={formData.description || ''}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/books/${id}`)}
            className="btn-secondary"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBook;