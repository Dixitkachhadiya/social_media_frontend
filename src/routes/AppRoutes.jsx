import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import AdminRoute from './AdminRoute';
import AppLayout from '../components/layout/AppLayout';
import { FullPageSpinner } from '../components/common/Spinner';
import Spinner from '../components/common/Spinner';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';

// Core pages
import FeedPage from '../pages/feed/FeedPage';
import ExplorePage from '../pages/explore/ExplorePage';
import CreatePostPage from '../pages/posts/CreatePostPage';
import PostDetailPage from '../pages/posts/PostDetailPage';
import ProfilePage from '../pages/profile/ProfilePage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

// Heavier, less-visited sections are split into their own chunks
const AIAssistantPage = lazy(() => import('../pages/ai/AIAssistantPage'));
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const AdminOverviewPage = lazy(() => import('../pages/admin/AdminOverviewPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminActivityPage = lazy(() => import('../pages/admin/AdminActivityPage'));
const AdminModerationPage = lazy(() => import('../pages/admin/AdminModerationPage'));
const AdminAnnouncementsPage = lazy(() => import('../pages/admin/AdminAnnouncementsPage'));

const sectionFallback = (
  <div className="flex justify-center py-20 text-brand-600">
    <Spinner label="Loading" />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Reached from /forgot-password or from Settings, logged in or not */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          {/* Full-screen step after sign-up; always verifies the logged-in user's own email */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          <Route element={<AppLayout />}>
            <Route index element={<FeedPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/create" element={<CreatePostPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/u/:id" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/ai"
              element={
                <Suspense fallback={sectionFallback}>
                  <AIAssistantPage />
                </Suspense>
              }
            />

            <Route element={<AdminRoute />}>
              <Route
                path="/admin"
                element={
                  <Suspense fallback={sectionFallback}>
                    <AdminLayout />
                  </Suspense>
                }
              >
                <Route index element={<AdminOverviewPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="activity" element={<AdminActivityPage />} />
                <Route path="moderation" element={<AdminModerationPage />} />
                <Route path="announcements" element={<AdminAnnouncementsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
