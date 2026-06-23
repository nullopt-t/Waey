import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { getApiUrl } from '../config.js';
import NotificationBell from './NotificationBell.jsx';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const accountDropdownRef = React.useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutDialog(false);
  };

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAccountDropdown && accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setShowAccountDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccountDropdown]);

  // Prevent scrolling on the main page when sidebar is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="bg-[var(--bg-secondary)]/80 backdrop-blur-md shadow-md sticky top-0 z-[70] border-b border-[var(--border-color)]/30">
        <nav className="py-3">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
            {/* Right Side - Logo + Desktop Navigation */}
            <div className="flex items-center gap-3 lg:gap-6">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0">
                <img src="/logo192.png" alt="منصة وعي" className="h-9 sm:h-10 w-auto" />
              </Link>

              {/* Desktop Navigation */}
              {user?.role !== 'admin' && (
                <div className="hidden lg:flex items-center gap-6">
                  <Link to="/" className={`font-medium ${location.pathname === '/' ? 'text-[#c5a98e]' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] transition-colors`}>الرئيسية</Link>
                  <Link to="/categories" className={`font-medium ${location.pathname === '/categories' ? 'text-[#c5a98e]' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] transition-colors`}>الأقسام</Link>
                  <Link
                    to="/assessments"
                    className={`font-medium ${location.pathname === '/assessments' ? 'text-[#c5a98e]' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] transition-colors`}
                  >
                    الاختبارات
                  </Link>
                  <Link to="/about" className={`font-medium ${location.pathname === '/about' ? 'text-[#c5a98e]' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] transition-colors`}>عن وعي</Link>
                  <Link to="/contact" className={`font-medium ${location.pathname === '/contact' ? 'text-[#c5a98e]' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] transition-colors`}>تواصل معنا</Link>
                </div>
              )}
            </div>

            {/* Left Side - Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="lg:hidden text-[var(--text-primary)] p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <i className="fas fa-times text-xl"></i>
                ) : (
                  <i className="fas fa-bars text-xl"></i>
                )}
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <NotificationBell />

                  {/* Account Icon with Dropdown */}
                  <div className="account-dropdown relative" ref={accountDropdownRef}>
                    <button
                      onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
                      title="الحساب"
                    >
                      {user?.avatar ? (
                        <img
                          src={getApiUrl(user.avatar)}
                          alt={user.firstName}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={`${user?.avatar ? 'hidden' : 'w-full h-full flex items-center justify-center'}`}>
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'م'}
                      </span>
                    </button>

                    {/* Desktop Dropdown Card */}
                    {showAccountDropdown && (
                      <div className="hidden lg:block absolute left-0 mt-2 w-80 bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 overflow-hidden z-[80]">
                        {/* User Info Header */}
                        <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] p-6 text-white">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0">
                              {user?.avatar ? (
                                <img
                                  src={getApiUrl(user.avatar)}
                                  alt={user.firstName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'م'
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold truncate">{user?.firstName} {user?.lastName}</h3>
                              <p className="text-sm text-white/80 truncate">{user?.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {user?.role === 'therapist' && (
                                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">معالج</span>
                                )}
                                <span className="text-xs bg-white/10 px-2 py-1 rounded font-mono truncate max-w-[120px]" title="معرف المستخدم">
                                  #{user?._id?.slice(-6)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-3">
                          <div className="space-y-1">
                            {/* Admin: Only show admin dashboard link */}
                            {user?.role === 'admin' ? (
                              <Link
                                to="/admin"
                                className="flex items-center gap-3 px-4 py-2.5 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-all duration-300 group"
                                onClick={() => setShowAccountDropdown(false)}
                              >
                                <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center group-hover:bg-[var(--primary-color)]/20 transition-colors">
                                  <i className="fas fa-shield-alt text-[var(--primary-color)]"></i>
                                </div>
                                <span className="font-medium">لوحة الإدارة</span>
                              </Link>
                            ) : (
                              <>
                                <Link
                                  to={user?.role === 'therapist' ? '/therapist/dashboard' : user?.role === 'admin' ? '/admin' : '/user-dashboard'}
                                  className="flex items-center gap-3 px-4 py-2.5 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-all duration-300 group"
                                  onClick={() => setShowAccountDropdown(false)}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center group-hover:bg-[var(--primary-color)]/20 transition-colors">
                                    <i className="fas fa-th-large text-[var(--primary-color)]"></i>
                                  </div>
                                  <span className="font-medium">لوحة التحكم</span>
                                </Link>
                                <Link
                                  to="/profile-settings"
                                  className="flex items-center gap-3 px-4 py-2.5 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-all duration-300 group"
                                  onClick={() => setShowAccountDropdown(false)}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center group-hover:bg-[var(--primary-color)]/20 transition-colors">
                                    <i className="fas fa-user text-[var(--primary-color)]"></i>
                                  </div>
                                  <span className="font-medium">الملف الشخصي</span>
                                </Link>
                                <Link
                                  to="/saved-posts"
                                  className="flex items-center gap-3 px-4 py-2.5 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-all duration-300 group"
                                  onClick={() => setShowAccountDropdown(false)}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center group-hover:bg-[var(--primary-color)]/20 transition-colors">
                                    <i className="fas fa-bookmark text-[var(--primary-color)]"></i>
                                  </div>
                                  <span className="font-medium">المنشورات المحفوظة</span>
                                </Link>
                                <Link
                                  to="/account-settings"
                                  className="flex items-center gap-3 px-4 py-2.5 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-all duration-300 group"
                                  onClick={() => setShowAccountDropdown(false)}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center group-hover:bg-[var(--primary-color)]/20 transition-colors">
                                    <i className="fas fa-cog text-[var(--primary-color)]"></i>
                                  </div>
                                  <span className="font-medium">إعدادات الحساب</span>
                                </Link>
                              </>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="border-t border-[var(--border-color)]/30 my-2"></div>

                          {/* Logout */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowAccountDropdown(false);
                              setShowLogoutDialog(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                              <i className="fas fa-sign-out-alt text-red-500"></i>
                            </div>
                            <span className="font-medium">تسجيل الخروج</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:block px-3 md:px-4 py-2 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[#4a5d5e] hover:text-white transition-colors min-h-[44px] flex items-center justify-center">
                    تسجيل دخول
                  </Link>
                  <Link to="/signup" className="hidden sm:block px-3 md:px-4 py-2 bg-[#3d5a5a] text-white rounded-lg font-medium hover:bg-[#2c4a4a] transition-colors min-h-[44px] flex items-center justify-center">
                    انضم إلينا
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Account Dropdown */}
          {showAccountDropdown && (
            <div className="lg:hidden bg-[var(--card-bg)] backdrop-blur-md border-t border-[var(--border-color)]/30 py-4 px-4 z-[80] relative">
              {/* User Info */}
              <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] rounded-xl p-4 text-white mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={getApiUrl(user.avatar)}
                        alt={user.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'م'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{user?.firstName} {user?.lastName}</h4>
                    <p className="text-xs text-white/80 truncate">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {user?.role === 'therapist' && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">معالج</span>
                      )}
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded font-mono">
                        #{user?._id?.slice(-6)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                {user?.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-all duration-300"
                    onClick={() => setShowAccountDropdown(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center">
                      <i className="fas fa-shield-alt text-[var(--primary-color)]"></i>
                    </div>
                    <span className="font-medium">لوحة الإدارة</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to={user?.role === 'therapist' ? '/therapist/dashboard' : user?.role === 'admin' ? '/admin' : '/user-dashboard'}
                      className="flex items-center gap-3 px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-all duration-300"
                      onClick={() => setShowAccountDropdown(false)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center">
                        <i className="fas fa-th-large text-[var(--primary-color)]"></i>
                      </div>
                      <span className="font-medium">لوحة التحكم</span>
                    </Link>
                    <Link
                      to="/profile-settings"
                      className="flex items-center gap-3 px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-all duration-300"
                      onClick={() => setShowAccountDropdown(false)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center">
                        <i className="fas fa-user text-[var(--primary-color)]"></i>
                      </div>
                      <span className="font-medium">الملف الشخصي</span>
                    </Link>
                    <Link
                      to="/saved-posts"
                      className="flex items-center gap-3 px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-all duration-300"
                      onClick={() => setShowAccountDropdown(false)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center">
                        <i className="fas fa-bookmark text-[var(--primary-color)]"></i>
                      </div>
                      <span className="font-medium">المنشورات المحفوظة</span>
                    </Link>
                    <Link
                      to="/account-settings"
                      className="flex items-center gap-3 px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-all duration-300"
                      onClick={() => setShowAccountDropdown(false)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center">
                        <i className="fas fa-cog text-[var(--primary-color)]"></i>
                      </div>
                      <span className="font-medium">إعدادات الحساب</span>
                    </Link>
                  </>
                )}

                {/* Divider */}
                <div className="border-t border-[var(--border-color)]/30 my-2"></div>

                {/* Logout */}
                <button
                  type="button"
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    setShowAccountDropdown(false);
                    setShowLogoutDialog(true);
                  }}
                  onClick={() => {
                    setShowAccountDropdown(false);
                    setShowLogoutDialog(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <i className="fas fa-sign-out-alt text-red-500"></i>
                  </div>
                  <span className="font-medium">تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile Menu Sidebar */}
          {isMenuOpen && (
            <div className="fixed inset-0 z-40 bg-[var(--bg-primary)] bg-opacity-90 flex lg:hidden">
              <div
                className="bg-[var(--bg-secondary)]/90 backdrop-blur-md w-64 h-screen overflow-y-auto border-r border-[var(--border-color)]/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <div className="flex justify-between items-center p-6">
                  <Link to="/" onClick={() => setIsMenuOpen(false)}>
                    <img src="/logo192.png" alt="منصة وعي" className="h-10 w-auto" />
                  </Link>
                  <button
                    onClick={toggleMenu}
                    className="text-[var(--text-primary)] focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Close menu"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
                {user?.role !== 'admin' && (
                  <div className="px-6 pb-6 flex flex-col space-y-4">
                    <Link
                      to="/"
                      className={`font-medium py-3 px-4 rounded-lg ${location.pathname === '/' ? 'text-[#c5a98e] bg-[var(--bg-primary)]/50' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] hover:bg-[var(--bg-primary)]/30 transition-colors`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      الرئيسية
                    </Link>
                    <Link
                      to="/categories"
                      className={`font-medium py-3 px-4 rounded-lg ${location.pathname === '/categories' ? 'text-[#c5a98e] bg-[var(--bg-primary)]/50' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] hover:bg-[var(--bg-primary)]/30 transition-colors`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      الأقسام
                    </Link>
                    <Link
                      to="/assessments"
                      className={`font-medium py-3 px-4 rounded-lg ${location.pathname === '/assessments' ? 'text-[#c5a98e] bg-[var(--bg-primary)]/50' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] hover:bg-[var(--bg-primary)]/30 transition-colors`}
                    >
                      الاختبارات
                    </Link>
                    <Link
                      to="/about"
                      className={`font-medium py-3 px-4 rounded-lg ${location.pathname === '/about' ? 'text-[#c5a98e] bg-[var(--bg-primary)]/50' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] hover:bg-[var(--bg-primary)]/30 transition-colors`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      عن وعي
                    </Link>
                    <Link
                      to="/contact"
                      className={`font-medium py-3 px-4 rounded-lg ${location.pathname === '/contact' ? 'text-[#c5a98e] bg-[var(--bg-primary)]/50' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] hover:bg-[var(--bg-primary)]/30 transition-colors`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      تواصل معنا
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Logout Confirmation Dialog - Rendered outside header for proper centering */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="تسجيل الخروج"
        message="هل أنت متأكد من تسجيل الخروج؟"
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </>
  );
};

export default Header;
