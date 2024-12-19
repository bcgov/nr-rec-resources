import { useLocation } from 'react-router-dom';
import '@/styles/components/BreadCrumbs.scss';

interface BreadCrumbsProps {
  customPathNames?: string[];
}

const BreadCrumbs = ({ customPathNames }: BreadCrumbsProps) => {
  const { pathname } = useLocation();
  const pathnames = pathname.split('/').filter((x) => x);

  return (
    <div className="breadcrumbs">
      <a href="/">Home</a>
      <span className="spacer">&gt;</span>
      {pathnames.length > 0 &&
        pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const pathName = customPathNames?.[index] ?? name;

          return index === pathnames.length - 1 ? (
            <span key={pathName}>{pathName}</span>
          ) : (
            <>
              <a href={routeTo} key={pathName}>
                {pathName}
              </a>
              <span className="spacer">&gt;</span>
            </>
          );
        })}
    </div>
  );
};

export default BreadCrumbs;
