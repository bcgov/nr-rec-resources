import { ReactNode } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Spinner } from 'react-bootstrap';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, error } = useAuthContext();

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div>
        <h1>Authentication error</h1>
        <p>{error.getMessage()}</p>
      </div>
    );
  }

  return <>{children}</>;
};
