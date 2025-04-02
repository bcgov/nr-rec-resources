import { FC, ReactNode } from 'react';
import './SectionHeading.scss';

interface SectionHeadingProps {
  children: ReactNode;
}

export const SectionHeading: FC<SectionHeadingProps> = ({ children }) => {
  return <h2 className="section-heading">{children}</h2>;
};
