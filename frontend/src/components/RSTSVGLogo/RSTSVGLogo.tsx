import { FC } from 'react';
import RSTLogo from '@/images/RST_nav_logo.svg';
import '@/components/RSTSVGLogo/RSTSVGLogo.scss';

export const RSTSVGLogo: FC = () => {
  return (
    <div className="rst-svg-logo-container d-flex align-items-center justify-content-center px-4 w-100 h-100">
      <img
        className={'rst-logo'}
        src={RSTLogo}
        width={200}
        height={64}
        alt="Recreation Sites and Trails BC Logo"
      />
    </div>
  );
};
