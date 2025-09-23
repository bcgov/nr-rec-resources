import { Link } from 'react-router-dom';
import { trackEvent } from '@/utils/matomo';
import {
  SEARCH_LINKS,
  SEARCH_LINKS_TITLE,
} from '@/components/search/constants';
import '@/components/search/SearchLinks.scss';

const SearchLinks = () => {
  const handleLinkClick = (trackingName: string) => {
    trackEvent({
      category: 'Search',
      action: 'Click',
      name: `Search link - ${trackingName}`,
    });
  };

  return (
    <div className="search-links-desktop">
      <div className="fs-6 fw-bold mb-1">{SEARCH_LINKS_TITLE}</div>
      {SEARCH_LINKS.map((link) => (
        <Link
          key={link.trackingName}
          to={{ pathname: link.path, search: link.search }}
          onClick={() => handleLinkClick(link.trackingName)}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
};

export default SearchLinks;
