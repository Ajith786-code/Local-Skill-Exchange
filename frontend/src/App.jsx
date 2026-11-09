import { Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import RequestsPage from './pages/RequestsPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import PublicProfilePage from './pages/PublicProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:requestId" element={<ChatPage />} />
          <Route path="/users/:userId" element={<PublicProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
