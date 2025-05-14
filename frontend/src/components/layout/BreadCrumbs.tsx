import { useParams } from 'react-router-dom';
import HomeIcon from '@/images/icons/home.svg';
import ChevronRightIcon from '@/images/icons/chevron-right.svg';
import '@/components/layout/BreadCrumbs.scss';

const BreadCrumbs = () => {
  const { id } = useParams();

  const lastSearch = sessionStorage.getItem('lastSearch');

  return (
    <div className="breadcrumbs">
      <a href="/" aria-label="Home">
        <img src={HomeIcon} alt="Home icon" />
      </a>
      <img src={ChevronRightIcon} alt="chevron icon" />
      <a href={`/search${lastSearch ? lastSearch : ''}`}>
        Find a site or trail
      </a>
      <img src={ChevronRightIcon} alt="chevron icon" />
      <span className="current-path">{id}</span>
    </div>
  );
};

export default BreadCrumbs;
