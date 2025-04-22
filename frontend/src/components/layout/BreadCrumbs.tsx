import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import HomeIcon from '@/images/icons/home.svg';
import ChevronRightIcon from '@/images/icons/chevron-right.svg';
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
      <a href="/">
        <img src={HomeIcon} alt="icon" />
      </a>
      <img src={ChevronRightIcon} alt="chevron" />
      {paths.length > 0 &&
        paths.map((name, index) => {
          const pathName = customPaths?.[index]?.name ?? name;
          const routeTo = `/${paths.slice(0, index + 1).join('/')}`;

          return index === paths.length - 1 ? (
            <span key={pathName} className="current-path">
              {pathName}
            </span>
          ) : (
            <Fragment key={pathName}>
              <a href={routeTo} key={pathName}>
                {pathName}
              </a>
              <img src={ChevronRightIcon} alt="chevron" />
            </Fragment>
          );
        })}
    </div>
  );
};

export default BreadCrumbs;
