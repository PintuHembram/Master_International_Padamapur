import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export const TeacherProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isTeacher, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || (!isAdmin && !isTeacher)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
