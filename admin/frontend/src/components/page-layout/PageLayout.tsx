/**
 * PageLayout constrains content to a max width and provides responsive padding.
 * Use for all pages except the landing page.
 */
import './PageLayout.scss';

export const PageLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="page-layout__container py-4">{children}</div>
);
