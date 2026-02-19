import { useAuthContext } from '@/contexts/AuthContext';
import { LoginPage, UnauthorizedPage } from '@/pages/auth';
import { ReactNode } from 'react';
import { Button, Spinner } from 'react-bootstrap';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuthenticated, isAuthorized, error, authService } =
    useAuthContext();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 p-3">
        <h1 className="h4 mb-2">Authentication error</h1>
        <p className="text-body-secondary mb-3 text-center">
          {error.getMessage()}
        </p>
        <Button variant="primary" onClick={() => authService.login()}>
          Log in again
        </Button>
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
