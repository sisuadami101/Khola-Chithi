
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import SingleBlogPage from './pages/SingleBlogPage';
import ApplyModeratorPage from './pages/ApplyModeratorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/user/UserDashboard';
import ModeratorDashboard from './pages/moderator/ModeratorDashboard';
import ModeratorLogin from './pages/moderator/ModeratorLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import WriteLetterPage from './pages/user/WriteLetterPage';
import MyLettersPage from './pages/user/MyLettersPage';
import UserProfilePage from './pages/user/UserProfilePage';
import DonationPage from './pages/DonationPage';
import CommunityFeedPage from './pages/CommunityFeedPage';
import SubscriptionPage from './pages/SubscriptionPage';
import UserRewardsPage from './pages/user/UserRewardsPage';
import ModeratorPerformancePage from './pages/moderator/ModeratorPerformancePage';
import WallOfMemoriesPage from './pages/WallOfMemoriesPage';
import SupportGroupsPage from './pages/SupportGroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import ModeratorProfilePage from './pages/moderator/ModeratorProfilePage';
import ModeratorPostsPage from './pages/moderator/ModeratorPostsPage';
import ModeratorWriteBlogPage from './pages/moderator/ModeratorWriteBlogPage';

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  if (loading) return <div>{t('misc.loading')}</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const UserPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const { t } = useLanguage();
  if (loading) return <div className="text-center p-4">{t('misc.loading')}</div>;

  if (user && user.type === 'user') {
    if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      alert(t('userDashboard.suspensionAlert', { date: new Date(user.suspendedUntil).toLocaleString(t('langName') === 'বাংলা' ? 'bn-BD' : 'en-US') }));
      logout();
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  }
  
  return <Navigate to="/login" />;
};

const ModeratorPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, logout } = useAuth(); // Added logout here
  const { t } = useLanguage();
  if (loading) return <div className="text-center p-4">{t('misc.loading')}</div>;

  if (user && user.type === 'moderator' && user.isActive) {
    if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      alert(t('userDashboard.suspensionAlert', { date: new Date(user.suspendedUntil).toLocaleString(t('langName') === 'বাংলা' ? 'bn-BD' : 'en-US') }));
      logout(); // Logout moderator if suspended
      return <Navigate to="/moderator/login" />;
    }
    return <>{children}</>;
  }
  
  return <Navigate to="/moderator/login" />;
};

const AdminPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // In a real app, admin auth would be more robust.
    const { user, loading } = useAuth();
    const { t } = useLanguage();
    if (loading) return <div className="text-center p-4">{t('misc.loading')}</div>;
    return user && user.type === 'admin' ? <>{children}</> : <Navigate to="/" />;
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <LanguageProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<SingleBlogPage />} />
              <Route path="/apply-moderator" element={<ApplyModeratorPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/donate" element={<DonationPage />} />
              <Route path="/community" element={<AuthRoute><CommunityFeedPage /></AuthRoute>} />
              <Route path="/subscribe" element={<SubscriptionPage />} />
              <Route path="/wall-of-memories" element={<WallOfMemoriesPage />} />
              <Route path="/groups" element={<SupportGroupsPage />} />
              <Route path="/groups/:id" element={<UserPrivateRoute><GroupDetailPage /></UserPrivateRoute>} />


              <Route path="/user" element={<UserPrivateRoute><UserDashboard /></UserPrivateRoute>}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="write-letter" element={<WriteLetterPage />} />
                <Route path="my-letters" element={<MyLettersPage />} />
                <Route path="rewards" element={<UserRewardsPage />} />
              </Route>
              
              <Route path="/moderator/login" element={<ModeratorLogin />} />
              <Route path="/moderator" element={<ModeratorPrivateRoute><ModeratorDashboard /></ModeratorPrivateRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<ModeratorPerformancePage />} />
                  <Route path="profile" element={<ModeratorProfilePage />} />
                  <Route path="posts" element={<ModeratorPostsPage />} />
                  <Route path="write-blog" element={<ModeratorWriteBlogPage />} />
              </Route>

              {/* This is a simulated admin route */}
              <Route path="/admin" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </HashRouter>
        </LanguageProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
