import { useLocation } from 'react-router-dom';
import '@/styles/components/BreadCrumbs.scss';

const BreadCrumbs = () => {
  const { pathname } = useLocation();
  const pathnames = pathname.split('/').filter((x) => x);

  return (
    <div className="breadcrumbs">
      <a href="/">Home</a>
      <span>&gt;</span>
      {pathnames.length > 0 &&
        pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;

          return index === pathnames.length - 1 ? (
            <span key={name}>{name}</span>
          ) : (
            <>
              <a href={routeTo} key={name}>
                {name}
              </a>
              <span>&gt;</span>
            </>
          );
        })}
    </div>
  );
};

export default BreadCrumbs;
