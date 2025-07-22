import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  color: string;
  _count: {
    books: number;
  };
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6'
  });

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        const response = await api.put(`/categories/${editingCategory.id}`, formData);
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? response.data : cat
        ));
      } else {
        const response = await api.post('/categories', formData);
        setCategories([...categories, { ...response.data, _count: { books: 0 } }]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Kategori kaydedilirken hata:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategorideki kitaplar kategorisiz kalacak.')) {
      return;
    }

    try {
      await api.delete(`/categories/${categoryId}`);
      setCategories(categories.filter(cat => cat.id !== categoryId));
    } catch (error) {
      console.error('Kategori silinirken hata:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', color: '#3B82F6' });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Kategoriler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Kategori Ekle
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Adı *
              </label>
              <input
                type="text"
                id="name"
                required
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Renk
              </label>
              <div className="flex space-x-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                İptal
              </button>
              <button type="submit" className="btn-primary">
                {editingCategory ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz kategori eklenmemiş
          </h3>
          <p className="text-gray-600 mb-4">
            Kitaplarınızı organize etmek için kategoriler oluşturun!
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            İlk Kategoriyi Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <BookOpenIcon className="w-5 h-5 mr-2" />
                <span className="text-sm">
                  {category._count.books} kitap
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div
                  className="w-full h-2 rounded-full"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: category.color,
                      width: `${Math.min((category._count.books / Math.max(...categories.map(c => c._count.books), 1)) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Stats */}
      {categories.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kategori İstatistikleri</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600">Toplam Kategori</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {categories.reduce((sum, cat) => sum + cat._count.books, 0)}
              </div>
              <div className="text-sm text-gray-600">Kategorili Kitap</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + cat._count.books, 0) / categories.length) : 0}
              </div>
              <div className="text-sm text-gray-600">Ortalama Kitap/Kategori</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;