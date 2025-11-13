import clsx from 'clsx';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import './LoginPanel.scss';

interface LoginPanelProps {
  onLogin: () => void;
  buttonText?: string;
  className?: string;
}

export const LoginPanel: FC<LoginPanelProps> = ({
  onLogin,
  buttonText = 'Login',
  className = '',
}: LoginPanelProps) => {
  const rootClass = clsx(
    'login-panel d-flex align-items-center justify-content-start p-0 position-relative min-vh-100',
    className,
  );

  return (
    <div className={rootClass}>
      <div className="login-panel__card position-relative text-start mw-100 ms-0">
        <h2 className="login-panel__title fs-1 fw-normal text-white mb-2">
          Login
        </h2>
        <p className="login-panel__subtitle fs-6 text-white-50 mb-4 lh-base">
          Use your IDIR to access the Staff Portal
        </p>
        <Button
          variant="secondary"
          size="lg"
          onClick={onLogin}
          className="login-panel__button d-inline-flex justify-content-center align-items-center"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};
