import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Category {
  id: string;
  name: string;
  color: string;
}

const AddBook = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    coverImage: '',
    totalPages: '',
    categoryId: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/books', {
        ...formData,
        totalPages: formData.totalPages ? parseInt(formData.totalPages) : null,
        categoryId: formData.categoryId || null
      });
      navigate('/books');
    } catch (error) {
      console.error('Kitap eklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Kitap Ekle</h1>
      
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
              value={formData.isbn}
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
              value={formData.totalPages}
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
              value={formData.categoryId}
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
              value={formData.coverImage}
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
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="btn-secondary"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Ekleniyor...' : 'Kitap Ekle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBook;