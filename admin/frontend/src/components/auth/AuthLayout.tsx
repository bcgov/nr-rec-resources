import { Header } from '@/components/header/Header';
import { ViewOnlyBanner } from '@/components/auth/ViewOnlyBanner';
import { ReactNode } from 'react';
import './AuthLayout.scss';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="auth-page">
      <Header />
      <ViewOnlyBanner />

      <div className="auth-layout">{children}</div>
    </div>
  );
};
