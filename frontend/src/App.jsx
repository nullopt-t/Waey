import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { JourneyProvider } from './context/JourneyContext.jsx';
import { ErrorProvider } from './context/ErrorContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './styles/App.css';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import VisionPage from './pages/VisionPage.jsx';
import HabitsPage from './pages/HabitsPage.jsx';
import StoriesPage from './pages/StoriesPage.jsx';
import StoryDetailPage from './pages/StoryDetailPage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ChatbotPage from './pages/ChatbotPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import PendingApprovalPage from './pages/PendingApprovalPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import VideosPage from './pages/VideosPage.jsx';
import FindTherapistPage from './pages/FindTherapistPage.jsx';
import TherapistDetailPage from './pages/TherapistDetailPage.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import TherapistDashboard from './pages/TherapistDashboard.jsx';
import ProfileSettingsPage from './pages/ProfileSettingsPage.jsx';
import AccountSettingsPage from './pages/AccountSettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ComingSoonPage from './pages/ComingSoonPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import SavedPostsPage from './pages/SavedPostsPage.jsx';
import ArticlesPage from './pages/ArticlesPage.jsx';
import ArticleDetailPage from './pages/ArticleDetailPage.jsx';
import ArticleManagementPage from './pages/ArticleManagementPage.jsx';
import BooksPage from './pages/BooksPage.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';
import BookManagementPage from './pages/BookManagementPage.jsx';
import VideoManagementPage from './pages/VideoManagementPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminArticles from './pages/admin/AdminArticles.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminStories from './pages/admin/AdminStories.jsx';
import AdminBooks from './pages/admin/AdminBooks.jsx';
import AdminFeedback from './pages/admin/AdminFeedback.jsx';
import AdminTherapistsPage from './pages/admin/AdminTherapistsPage.jsx';
import AdminMedicalContacts from './pages/admin/AdminMedicalContacts.jsx';
import AdminJourneysPage from './pages/admin/AdminJourneysPage.jsx';
import MedicalContactsPage from './pages/MedicalContactsPage.jsx';
import CreateFutureMessagePage from './pages/CreateFutureMessagePage.jsx';
import FutureMessagesPage from './pages/FutureMessagesPage.jsx';
import AnimatedRoute from './components/AnimatedRoute.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import FloatingChatButton from './components/FloatingChatButton.jsx';
import JourneyPage from './pages/JourneyPage.jsx';
import JourneyLevelPage from './pages/JourneyLevelPage.jsx';
import WaeyAddictionPage from './pages/WaeyAddictionPage.jsx';
import AssessmentsPage from './pages/AssessmentsPage.jsx';
import AdminAssessmentsPage from './pages/admin/AdminAssessments.jsx';
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppWrapper() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/videos/manage') ||
    location.pathname.startsWith('/articles/manage') ||
    location.pathname.startsWith('/books/manage');
  const isChatbotRoute = location.pathname === '/chatbot';

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <ScrollToTop />
      {!isAdminRoute && !isChatbotRoute && <Header />}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <AnimatedRoute>
                <HomePage />
              </AnimatedRoute>
            } />
            <Route path="/categories" element={
              <AnimatedRoute>
                <CategoriesPage />
              </AnimatedRoute>
            } />
            <Route path="/community" element={
              <AnimatedRoute>
                <CommunityPage />
              </AnimatedRoute>
            } />
            <Route path="/community/post/:postId" element={
              <AnimatedRoute>
                <PostDetailPage />
              </AnimatedRoute>
            } />
            <Route path="/user/:userId" element={
              <AnimatedRoute>
                <UserProfilePage />
              </AnimatedRoute>
            } />
            <Route path="/saved-posts" element={
              <AnimatedRoute>
                <SavedPostsPage />
              </AnimatedRoute>
            } />
            <Route path="/articles" element={
              <AnimatedRoute>
                <ArticlesPage />
              </AnimatedRoute>
            } />
            <Route path="/articles/:articleId" element={
              <AnimatedRoute>
                <ArticleDetailPage />
              </AnimatedRoute>
            } />
            <Route path="/articles/manage" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout title="إدارة المقالات">
                    <ArticleManagementPage />
                  </AdminLayout>
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/books" element={
              <AnimatedRoute>
                <BooksPage />
              </AnimatedRoute>
            } />
            <Route path="/books/:bookId" element={
              <AnimatedRoute>
                <BookDetailPage />
              </AnimatedRoute>
            } />
            <Route path="/books/manage" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout title="إدارة الكتب">
                    <BookManagementPage />
                  </AdminLayout>
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/videos" element={
              <AnimatedRoute>
                <VideosPage />
              </AnimatedRoute>
            } />
            <Route path="/admin" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/admin/users" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/admin/articles" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminArticles />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/admin/reports" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReports />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/admin/stories" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStories />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/admin/books" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminBooks />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/admin/feedback" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFeedback />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/admin/therapists" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminTherapistsPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/admin/medical-contacts" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminMedicalContacts />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/admin/journeys" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminJourneysPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/admin/assessments" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAssessmentsPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/videos/manage" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout title="إدارة الفيديوهات">
                    <VideoManagementPage />
                  </AdminLayout>
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/future-messages" element={
              <AnimatedRoute>
                <ProtectedRoute>
                  <FutureMessagesPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/future-messages/create" element={
              <AnimatedRoute>
                <ProtectedRoute>
                  <CreateFutureMessagePage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/contact" element={
              <AnimatedRoute>
                <ContactPage />
              </AnimatedRoute>
            } />
            <Route path="/medical-contacts" element={
              <AnimatedRoute>
                <MedicalContactsPage />
              </AnimatedRoute>
            } />
            <Route path="/about" element={
              <AnimatedRoute>
                <AboutPage />
              </AnimatedRoute>
            } />
            <Route path="/login" element={
              <AnimatedRoute>
                <LoginPage />
              </AnimatedRoute>
            } />
            <Route path="/signup" element={
              <AnimatedRoute>
                <SignupPage />
              </AnimatedRoute>
            } />
            <Route path="/chatbot" element={
              <AnimatedRoute>
                <ProtectedRoute>
                  <ChatbotPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/faq" element={
              <AnimatedRoute>
                <HomePage />
              </AnimatedRoute>
            } />
            <Route path="/help" element={
              <AnimatedRoute>
                <ContactPage />
              </AnimatedRoute>
            } />
            <Route path="/privacy" element={
              <AnimatedRoute>
                <PrivacyPolicyPage />
              </AnimatedRoute>
            } />
            <Route path="/terms" element={
              <AnimatedRoute>
                <TermsPage />
              </AnimatedRoute>
            } />
            <Route path="/forgot-password" element={
              <AnimatedRoute>
                <ForgotPasswordPage />
              </AnimatedRoute>
            } />
            <Route path="/reset-password" element={
              <AnimatedRoute>
                <ResetPasswordPage />
              </AnimatedRoute>
            } />
            <Route path="/verify-email" element={
              <AnimatedRoute>
                <VerifyEmailPage />
              </AnimatedRoute>
            } />
            <Route path="/verify-email/pending-approval" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['therapist']}>
                  <PendingApprovalPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/find-therapist" element={
              <AnimatedRoute>
                <FindTherapistPage />
              </AnimatedRoute>
            } />
            <Route path="/therapists/:id" element={
              <AnimatedRoute>
                <ProtectedRoute>
                  <TherapistDetailPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/habits" element={
              <AnimatedRoute>
                <ProtectedRoute>
                  <HabitsPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/stories" element={
              <AnimatedRoute>
                <StoriesPage />
              </AnimatedRoute>
            } />
            <Route path="/stories/:id" element={
              <AnimatedRoute>
                <StoryDetailPage />
              </AnimatedRoute>
            } />
            <Route path="/journey" element={
              <AnimatedRoute>
                <ProtectedRoute>
                  <JourneyPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/journey/level/:levelNumber" element={
              <AnimatedRoute>
                <ProtectedRoute>
                  <JourneyLevelPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/waey-addiction" element={
              <AnimatedRoute>
                <WaeyAddictionPage />
              </AnimatedRoute>
            } />
            <Route path="/feedback" element={
              <AnimatedRoute>
                <ProtectedRoute>
                  <FeedbackPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/notifications" element={
              <AnimatedRoute>
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/dashboard" element={
              <AnimatedRoute>
                <DashboardRedirect />
              </AnimatedRoute>
            } />
            <Route path="/user-dashboard" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/therapist/dashboard" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['therapist']}>
                  <TherapistDashboard />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/profile-settings" element={
              <AnimatedRoute>
                <ProtectedRoute>
                  <ProfileSettingsPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/assessments" element={
              <AnimatedRoute>
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <AssessmentsPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            <Route path="/account-settings" element={
              <AnimatedRoute>
                <ProtectedRoute>
                  <AccountSettingsPage />
                </ProtectedRoute>
              </AnimatedRoute>
            } />
            {/* 404 Not Found - Catch-all route (must be last) */}
            <Route path="*" element={
              <AnimatedRoute>
                <NotFoundPage />
              </AnimatedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdminRoute && !isChatbotRoute && <Footer />}
      <FloatingChatButton />
    </div>
  );
}

// Component to redirect based on user role
function DashboardRedirect() {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on role
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (user?.role === 'therapist') {
    return <Navigate to="/therapist/dashboard" replace />;
  }

  return <Navigate to="/user-dashboard" replace />;
}

function App() {
  return (
    <ErrorProvider>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <QueryClientProvider client={queryClient}>
              <JourneyProvider>
                <Router>
                  <AppWrapper />
                </Router>
              </JourneyProvider>
            </QueryClientProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorProvider>
  );
}

export default App;
