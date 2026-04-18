import { Navigate } from 'react-router-dom';

/**
 * Guards the multi-step admission apply flow.
 * Applicants get a session in sessionStorage after starting/resuming an application.
 * Session shape: { applicationId: string, applicationNumber: string }
 */
export const ApplicationProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = sessionStorage.getItem('admissionSession');
  if (!session) {
    return <Navigate to="/admission/start" replace />;
  }
  return <>{children}</>;
};
