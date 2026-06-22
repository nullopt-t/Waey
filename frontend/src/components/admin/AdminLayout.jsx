import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-lock text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">غير مصرح</h1>
          <p className="text-[var(--text-secondary)] mb-6">ليس لديك صلاحية الوصول لهذه الصفحة</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin', icon: 'fa-chart-line', label: 'لوحة التحكم' },
    { path: '/admin/users', icon: 'fa-users', label: 'المستخدمين' },
    { path: '/admin/articles', icon: 'fa-newspaper', label: 'المقالات' },
    { path: '/admin/stories', icon: 'fa-book-open', label: 'القصص' },
    { path: '/admin/books', icon: 'fa-book', label: 'الكتب' },
    {
      path: '/admin/assessments',
      icon: 'fa-clipboard-list',
      label: 'الاختبارات',
    },
    { path: '/videos/manage', icon: 'fa-video', label: 'الفيديوهات' },
    { path: '/admin/therapists', icon: 'fa-user-md', label: 'المعالجين', hidden: true },
    { path: '/admin/feedback', icon: 'fa-comments', label: 'التغذية الراجعة' },
    { path: '/admin/reports', icon: 'fa-flag', label: 'البلاغات', hidden: true },
    { path: '/admin/journeys', icon: 'fa-road', label: 'الرحلات' },
    { path: '/admin/medical-contacts', icon: 'fa-phone-alt', label: 'جهات الاتصال' },
  ];

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen flex">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 w-11 h-11 bg-[var(--primary-color)] text-white rounded-xl flex items-center justify-center shadow-lg"
      >
        <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 right-0 h-screen w-64 lg:w-72 bg-[var(--card-bg)] backdrop-blur-md border-l border-[var(--border-color)]/30 shadow-2xl transform transition-transform duration-300 z-40 overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}>
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-xl flex items-center justify-center">
              <i className="fas fa-shield-alt text-2xl text-white"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">لوحة الإدارة</h2>
              <p className="text-xs text-[var(--text-secondary)]">مرحباً، {user?.firstName}</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            {menuItems.filter(item => !item.hidden).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                  ? 'bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <i className={`fas ${item.icon} w-5`}></i>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">{title}</h1>
              <p className="text-sm md:text-base text-[var(--text-secondary)]">إدارة المحتوى والمستخدمين</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl font-medium hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span className="hidden sm:inline">تسجيل خروج</span>
              </button>
            </div>
          </div>

          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
