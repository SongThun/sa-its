import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface InstructorRouteProps {
  children: React.ReactNode;
}

export default function InstructorRoute({ children }: InstructorRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== 'instructor') {
    return <Navigate to="/instructor/login" replace />;
  }

  return <>{children}</>;
}
