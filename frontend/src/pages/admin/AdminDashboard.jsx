import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import { apiRequest } from '../../api.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    articles: 0,
    videos: 0,
    reports: 0,
    stories: 0,
    books: 0,
    feedback: 0,
    therapists: 0,
    medicalContacts: 0,
    journeys: 0,
    assessments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel with proper error handling
      const promises = [
        apiRequest('/users', { method: 'GET' }).catch(() => ({ users: [], total: 0 })),
        apiRequest('/articles?status=all&limit=1', { method: 'GET' }).catch(() => ({ articles: [], total: 0 })),
        apiRequest('/videos/admin/all?page=1&limit=1', { method: 'GET' }).catch(() => ({ videos: [], total: 0 })),
        apiRequest('/community/reports?page=1&limit=1', { method: 'GET' }).catch(() => ({ reports: [], total: 0 })),
        apiRequest('/stories/admin/all?page=1&limit=1', { method: 'GET' }).catch(() => ({ stories: [], pagination: { total: 0 } })),
        apiRequest('/books/admin/all?page=1&limit=1', { method: 'GET' }).catch(() => ({ books: [], total: 0 })),
        apiRequest('/feedback/admin?page=1&limit=1', { method: 'GET' }).catch(() => ({ data: [], pagination: { total: 0 } })),
        apiRequest('/therapists/admin/all?page=1&limit=1', { method: 'GET' }).catch(() => ({ therapists: [], total: 0 })),
        apiRequest('/medical-contacts/admin?page=1&limit=1', { method: 'GET' }).catch(() => ({ data: [], pagination: { total: 0 } })),
        apiRequest('/journey/admin/all', { method: 'GET' }).catch(() => []),
        apiRequest('/journey/admin/all', { method: 'GET' }).catch(() => []),
        apiRequest('/assessments', { method: 'GET' }).catch(() => []),
      ];

      const [usersData,
        articlesData,
        videosData,
        reportsData,
        storiesData,
        booksData,
        feedbackData,
        therapistsData,
        medicalContactsData,
        journeysData,
        assessmentsData,] = await Promise.all(promises);

      // Get counts from API responses
      setStats({
        users: usersData?.total || 0,
        articles: articlesData?.total || 0,
        videos: videosData?.total || 0,
        reports: reportsData?.total || 0,
        stories: storiesData?.pagination?.total || 0,
        books: booksData?.total || 0,
        feedback: feedbackData?.pagination?.total || 0,
        therapists: therapistsData?.total || 0,
        medicalContacts: medicalContactsData?.pagination?.total || 0,
        journeys: Array.isArray(journeysData) ? journeysData.length : 0,
        assessments: Array.isArray(assessmentsData)
          ? assessmentsData.length
          : assessmentsData?.assessments?.length || 0,
      });
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'المستخدمين',
      value: stats.users,
      icon: 'fa-users',
      color: 'from-blue-500 to-blue-600',
      link: '/admin/users',
    },
    {
      title: 'المقالات',
      value: stats.articles,
      icon: 'fa-newspaper',
      color: 'from-green-500 to-green-600',
      link: '/admin/articles',
    },
    {
      title: 'الفيديوهات',
      value: stats.videos,
      icon: 'fa-video',
      color: 'from-purple-500 to-purple-600',
      link: '/videos/manage',
    },
    {
      title: 'البلاغات',
      value: stats.reports,
      icon: 'fa-flag',
      color: 'from-orange-500 to-orange-600',
      link: '/admin/reports',
      hidden: true,
    },
    {
      title: 'القصص',
      value: stats.stories,
      icon: 'fa-book-open',
      color: 'from-amber-500 to-orange-600',
      link: '/admin/stories',
    },
    {
      title: 'الكتب',
      value: stats.books,
      icon: 'fa-book',
      color: 'from-indigo-500 to-violet-600',
      link: '/admin/books',
    },
    {
      title: 'التغذية الراجعة',
      value: stats.feedback || 0,
      icon: 'fa-comments',
      color: 'from-purple-500 to-purple-600',
      link: '/admin/feedback',
    },
    {
      title: 'المعالجين',
      value: stats.therapists || 0,
      icon: 'fa-user-md',
      color: 'from-teal-500 to-cyan-500',
      link: '/admin/therapists',
      hidden: true,
    },
    {
      title: 'جهات الاتصال الطبية',
      value: stats.medicalContacts || 0,
      icon: 'fa-phone-alt',
      color: 'from-rose-500 to-pink-600',
      link: '/admin/medical-contacts',
    },
    {
      title: 'الرحلات',
      value: stats.journeys || 0,
      icon: 'fa-road',
      color: 'from-violet-500 to-purple-600',
      link: '/admin/journeys',
    },
    {
      title: 'الاختبارات',
      value: stats.assessments || 0,
      icon: 'fa-clipboard-list',
      color: 'from-cyan-500 to-blue-600',
      link: '/admin/assessments',
    },
  ];

  return (
    <AdminLayout title="لوحة التحكم">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.filter(s => !s.hidden).map((stat, index) => (
          <AnimatedItem key={stat.title} type="slideUp" delay={index * 0.05}>
            <div
              onClick={() => navigate(stat.link)}
              className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all cursor-pointer hover:shadow-xl hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <i className={`fas ${stat.icon} text-2xl text-white`}></i>
                </div>
                {loading ? (
                  <div className="animate-pulse h-8 w-16 bg-[var(--bg-secondary)] rounded"></div>
                ) : (
                  <div className="text-3xl font-bold text-[var(--text-primary)]">{stat.value}</div>
                )}
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{stat.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">اضغط للتفاصيل</p>
            </div>
          </AnimatedItem>
        ))}
      </div>

    </AdminLayout>
  );
};

export default AdminDashboard;
