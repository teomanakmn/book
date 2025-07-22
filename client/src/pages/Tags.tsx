import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface Tag {
  id: string;
  name: string;
  _count: {
    books: number;
  };
}

const Tags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await api.get('/tags');
      setTags(response.data);
    } catch (error) {
      console.error('Etiketler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTag) {
        const response = await api.put(`/tags/${editingTag.id}`, formData);
        setTags(tags.map(tag => 
          tag.id === editingTag.id ? response.data : tag
        ));
      } else {
        const response = await api.post('/tags', formData);
        setTags([...tags, { ...response.data, _count: { books: 0 } }]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Etiket kaydedilirken hata:', error);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
    });
    setShowForm(true);
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm('Bu etiketi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/tags/${tagId}`);
      setTags(tags.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error('Etiket silinirken hata:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingTag(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Etiketler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Etiketler</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Etiket Ekle
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingTag ? 'Etiket Düzenle' : 'Yeni Etiket'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Etiket Adı *
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

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                İptal
              </button>
              <button type="submit" className="btn-primary">
                {editingTag ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <div className="text-center py-12">
          <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz etiket eklenmemiş
          </h3>
          <p className="text-gray-600 mb-4">
            Kitaplarınızı organize etmek için etiketler oluşturun!
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            İlk Etiketi Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <div key={tag.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <TagIcon className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tag.name}
                  </h3>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <BookOpenIcon className="w-5 h-5 mr-2" />
                <span className="text-sm">
                  {tag._count.books} kitap
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tags;