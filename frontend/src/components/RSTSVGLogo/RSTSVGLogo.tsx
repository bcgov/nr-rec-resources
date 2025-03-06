import React from 'react';
import BCLogo from '@/images/BC_nav_logo.svg';
import RSTLogo from '@/images/RST_nav_logo.svg';
import '@/components/RSTSVGLogo/RSTSVGLogo.scss';

export const RSTSVGLogo: React.FC = () => {
  return (
    <div
      className={
        'rst-svg-logo-container d-flex align-items-center justify-content-center px-4 w-100 h-100'
      }
    >
      <img className={'bc-logo'} src={BCLogo} alt="British Columbia Logo" />
      <img
        className={'rst-logo'}
        src={RSTLogo}
        alt="Recreation Sites and Trails BC Logo"
      />
    </div>
  );
};
