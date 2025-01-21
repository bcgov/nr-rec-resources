import { useLocation } from 'react-router-dom';
import '@/components/layout/BreadCrumbs.scss';

interface BreadCrumbsProps {
  customPaths?: { name: string; route: string }[];
}

const BreadCrumbs = ({ customPaths }: BreadCrumbsProps) => {
  const { pathname } = useLocation();
  const paths = pathname
    .split('/')
    .filter((x) => x)
    .map((path, index) => {
      return customPaths?.[index]?.route ?? path;
    });

  return (
    <div className="breadcrumbs">
      <a href="/">Home</a>
      <span className="spacer" />
      {paths.length > 0 &&
        paths.map((name, index) => {
          const pathName = customPaths?.[index]?.name ?? name;
          const routeTo = `/${paths.slice(0, index + 1).join('/')}`;

          return index === paths.length - 1 ? (
            <span key={pathName} className="current-path">
              {pathName}
            </span>
          ) : (
            <>
              <a href={routeTo} key={pathName}>
                {pathName}
              </a>
              <span className="spacer" />
            </>
          );
        })}
    </div>
  );
};

export default BreadCrumbs;
