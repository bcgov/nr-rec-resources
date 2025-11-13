import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginPanel } from '@/components/auth/LoginPanel';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCallback } from 'react';
import { Stack } from 'react-bootstrap';
import './UnauthorizedPage.scss';

export const UnauthorizedPage = () => {
  const { authService } = useAuthContext();

  const handleLogin = useCallback(() => {
    authService.login();
  }, [authService]);

  return (
    <AuthLayout>
      {/* Left Panel - Unauthorized Information */}
      <div className="unauthorized">
        <h1 className="unauthorized__title">
          You are not authorized to log in yet
        </h1>

        <Stack gap={3} className="unauthorized__body">
          <p>
            If this is your first time logging in to the staff web portal
            database operation you&apos;re in the right place! Email us at{' '}
            <a href="mailto:parksweb@gov.bc.ca" className="unauthorized__email">
              parksweb@gov.bc.ca
            </a>{' '}
            and we&apos;ll set up your account permissions.
          </p>

          <p>
            If you&apos;re here for another reason and you&apos;re unable to log
            in, contact{' '}
            <a href="mailto:parksweb@gov.bc.ca" className="unauthorized__email">
              parksweb@gov.bc.ca
            </a>{' '}
            and we&apos;ll help you out.
          </p>

          <LoginPanel className="d-lg-none" onLogin={handleLogin} />
        </Stack>
      </div>

      {/* Right Panel - Background Image */}
      <LoginPanel className="d-none d-lg-flex" onLogin={handleLogin} />
    </AuthLayout>
  );
};
