import { useAuthContext } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { ReactNode } from 'react';
import { Spinner } from 'react-bootstrap';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuthenticated, isAuthorized, error } = useAuthContext();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Authentication error</h1>
        <p>{error.getMessage()}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!isAuthorized) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};
