import { Header } from '@/components/header/Header';
import { ReactNode } from 'react';
import './AuthLayout.scss';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="auth-page">
      <Header />

      <div className="auth-layout">{children}</div>
    </div>
  );
};
