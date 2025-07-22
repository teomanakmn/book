import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface Stats {
  overview: {
    totalBooks: number;
    completedBooks: number;
    currentlyReading: number;
    toReadBooks: number;
    totalQuotes: number;
    avgPages: number;
    avgReadingSpeed: number;
  };
  booksByCategory: Array<{
    name: string;
    count: number;
    color: string;
  }>;
  monthlyStats: Array<{
    endDate: string;
    _count: { id: number };
  }>;
  topAuthors: Array<{
    name: string;
    count: number;
  }>;
}

const Stats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setStats(response.data);
      } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">İstatistikler yükleniyor...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          İstatistikler yüklenemedi
        </h3>
        <p className="text-gray-600">Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  // Prepare monthly data for chart
  const monthlyData = stats.monthlyStats.map(item => ({
    month: new Date(item.endDate).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
    books: item._count.id
  }));

  const completionRate = stats.overview.totalBooks > 0 
    ? Math.round((stats.overview.completedBooks / stats.overview.totalBooks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">İstatistikler</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Kitap</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.overview.totalBooks}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrophyIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.overview.completedBooks}
              </p>
              <p className="text-xs text-green-600">%{completionRate} tamamlanma</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Okuma Hızı</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.overview.avgReadingSpeed}
              </p>
              <p className="text-xs text-yellow-600">sayfa/gün</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alıntılar</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.overview.totalQuotes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Okuma Durumu</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Okundu</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.overview.completedBooks}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Okunuyor</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ 
                      width: `${stats.overview.totalBooks > 0 ? (stats.overview.currentlyReading / stats.overview.totalBooks) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.overview.currentlyReading}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Okunacak</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${stats.overview.totalBooks > 0 ? (stats.overview.toReadBooks / stats.overview.totalBooks) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.overview.toReadBooks}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Genel Bilgiler</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ortalama Sayfa</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.overview.avgPages} sayfa
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Toplam Alıntı</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.overview.totalQuotes}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Alıntı/Kitap</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.overview.completedBooks > 0 
                  ? Math.round(stats.overview.totalQuotes / stats.overview.completedBooks * 10) / 10
                  : 0
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Chart */}
      {stats.booksByCategory.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kategorilere Göre Dağılım</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.booksByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.booksByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Authors */}
      {stats.topAuthors.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">En Çok Okunan Yazarlar</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topAuthors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Reading */}
      {monthlyData.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aylık Okuma Trendi</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="books" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Achievement Cards */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Başarımlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <TrophyIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">İlk Kitap</h3>
            <p className="text-sm text-gray-600">
              {stats.overview.totalBooks > 0 ? 'Tamamlandı!' : 'İlk kitabını ekle'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <BookOpenIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Okuma Alışkanlığı</h3>
            <p className="text-sm text-gray-600">
              {stats.overview.completedBooks >= 5 ? 'Tamamlandı!' : `${5 - stats.overview.completedBooks} kitap kaldı`}
            </p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Alıntı Koleksiyoncusu</h3>
            <p className="text-sm text-gray-600">
              {stats.overview.totalQuotes >= 10 ? 'Tamamlandı!' : `${10 - stats.overview.totalQuotes} alıntı kaldı`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;