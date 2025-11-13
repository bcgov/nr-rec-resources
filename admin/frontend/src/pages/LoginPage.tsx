import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginPanel } from '@/components/auth/LoginPanel';
import { ROUTE_PATHS } from '@/constants/routes';
import { useAuthContext } from '@/contexts/AuthContext';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback } from 'react';
import './LoginPage.scss';

export const LoginPage = () => {
  const { authService } = useAuthContext();

  const handleLogin = useCallback(async () => {
    await authService.login(ROUTE_PATHS.LANDING);
  }, [authService]);

  return (
    <AuthLayout>
      {/* Left Panel - Information */}
      <div className="login-info bg-white overflow-auto d-flex flex-column">
        <div className="login-info__welcome mb-5">
          <h1 className="fs-2 fw-bold text-primary mb-4">
            Welcome to Recreation Sites and Trails Staff Portal
          </h1>
          <LoginPanel className="d-lg-none" onLogin={handleLogin} />
          <p className="mb-3 lh-base">
            The Sites & Trails Management Admin Tool is a central system
            designed to support the administration, oversight, and public
            presentation of recreational sites and trails across the province.
            It enables authorized users to efficiently manage site and trail
            data, coordinate maintenance activities, and ensure accurate,
            up-to-date information is available to the public.
          </p>
          <p className="mb-3 lh-base">
            To learn more about each RST program, visit:
          </p>
          <ul className="ps-4 mt-3">
            <li className="text-secondary mb-2">
              <a
                href="https://intranet.gov.bc.ca/env/card/recreation-hub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                Recreation Sites and Trails program internet page
              </a>
            </li>
          </ul>
        </div>

        <div className="login-info__contact d-flex flex-column shadow-sm rounded">
          <div className="login-info__contact-header d-flex align-items-center px-3 rounded-top">
            <h3 className="fs-5 fw-semibold text-dark mb-0">
              Contact Information
            </h3>
          </div>
          <div className="login-info__contact-content d-flex flex-column bg-white p-4 rounded-bottom">
            <p className="text-dark mb-0 lh-base mb-4">
              If you have questions regarding authorization [ # ] please contact
              the email below.
            </p>
            <div className="login-info__contact-item d-flex align-items-center">
              <div className="login-info__email-icon rounded-circle bg-primary d-flex align-items-center justify-content-center flex-shrink-0 me-3">
                <FontAwesomeIcon icon={faEnvelope} color="white" size="lg" />
              </div>
              <div className="login-info__email-content d-flex flex-column">
                <div className="login-info__email-label fw-semibold text-dark mb-1">
                  Email
                </div>
                <a href="mailto:RST@gov.bc.ca" className="text-decoration-none">
                  RST@gov.bc.ca
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login */}
      <LoginPanel className="d-none d-lg-flex" onLogin={handleLogin} />
    </AuthLayout>
  );
};
