import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullPage label="Loading your account..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}
