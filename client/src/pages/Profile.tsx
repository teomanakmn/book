import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);
    
    try {
      const response = await api.put('/auth/profile', profileForm);
      updateUser(response.data);
      setProfileSuccess('Profil bilgileriniz başarıyla güncellendi.');
    } catch (error: any) {
      setProfileError(error.response?.data?.error || 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setProfileLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setPasswordSuccess('Şifreniz başarıyla güncellendi.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setPasswordError(error.response?.data?.error || 'Şifre güncellenirken bir hata oluştu.');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz silinecektir.')) {
      return;
    }
    
    try {
      await api.delete('/auth/account');
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Hesap silinirken hata:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profil Ayarları</h1>
      
      {/* Profile Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserIcon className="w-5 h-5 mr-2" />
          Profil Bilgileri
        </h2>
        
        {profileError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            {profileError}
          </div>
        )}
        
        {profileSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center">
            <ShieldCheckIcon className="w-5 h-5 mr-2" />
            {profileSuccess}
          </div>
        )}
        
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad
            </label>
            <input
              type="text"
              id="name"
              className="input-field"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi
            </label>
            <div className="flex items-center">
              <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="email"
                id="email"
                className="input-field"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="btn-primary disabled:opacity-50"
            >
              {profileLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Change Password */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <KeyIcon className="w-5 h-5 mr-2" />
          Şifre Değiştir
        </h2>
        
        {passwordError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            {passwordError}
          </div>
        )}
        
        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center">
            <ShieldCheckIcon className="w-5 h-5 mr-2" />
            {passwordSuccess}
          </div>
        )}
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Mevcut Şifre
            </label>
            <input
              type="password"
              id="currentPassword"
              className="input-field"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre
            </label>
            <input
              type="password"
              id="newPassword"
              className="input-field"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="input-field"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary disabled:opacity-50"
            >
              {passwordLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Danger Zone */}
      <div className="card border border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Tehlikeli Bölge</h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Hesabınızı silmek tüm kitaplarınızı, alıntılarınızı ve diğer verilerinizi kalıcı olarak silecektir. Bu işlem geri alınamaz.
          </p>
          
          <div className="flex justify-end">
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Hesabımı Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;