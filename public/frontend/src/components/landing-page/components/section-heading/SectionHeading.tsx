import { ElementType, FC, ReactNode } from 'react';
import './SectionHeading.scss';

interface SectionHeadingProps {
  as?: ElementType;
  children?: ReactNode;
}

export const SectionHeading: FC<SectionHeadingProps> = ({ children, as }) => {
  const Component = as || 'h2';
  return <Component className="section-heading">{children}</Component>;
};
