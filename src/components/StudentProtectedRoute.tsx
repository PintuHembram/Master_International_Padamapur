import { Navigate } from 'react-router-dom';

export const StudentProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = sessionStorage.getItem('studentSession');
  if (!session) {
    return <Navigate to="/student/login" replace />;
  }
  return <>{children}</>;
};
