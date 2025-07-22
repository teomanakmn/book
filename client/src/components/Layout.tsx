import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  HomeIcon,
  BookOpenIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  PlusIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Ana Sayfa', href: '/', icon: HomeIcon },
    { name: 'Kitaplarım', href: '/books', icon: BookOpenIcon },
    { name: 'Kitap Ekle', href: '/add-book', icon: PlusIcon },
    { name: 'Kitap Ara', href: '/search', icon: MagnifyingGlassIcon },
    { name: 'Kategoriler', href: '/categories', icon: TagIcon },
    { name: 'Etiketler', href: '/tags', icon: TagIcon },
    { name: 'Alıntılar', href: '/quotes', icon: ChatBubbleLeftRightIcon },
    { name: 'İstatistikler', href: '/stats', icon: ChartBarIcon },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
          <h1 className="text-xl font-bold text-white">📚 Kitap Kayıt</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <UserIcon className="w-8 h-8 text-gray-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/profile"
            className="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 mb-2"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Profil Ayarları
          </Link>
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;