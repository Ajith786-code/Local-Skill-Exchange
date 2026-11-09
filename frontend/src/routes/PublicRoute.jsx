import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Login / register pages: logged-in users are sent to where they were heading (or the dashboard).
export default function PublicRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullPage label="Loading..." />;
  if (user) return <Navigate to={location.state?.from || '/dashboard'} replace />;
  return <Outlet />;
}
