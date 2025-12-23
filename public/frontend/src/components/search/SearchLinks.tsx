import { Link } from '@tanstack/react-router';
import {
  SEARCH_LINKS,
  SEARCH_LINKS_TITLE,
} from '@/components/search/constants';
import '@/components/search/SearchLinks.scss';

const SearchLinks = () => {
  return (
    <div className="search-links-desktop">
      <div className="fs-6 fw-bold mb-1">{SEARCH_LINKS_TITLE}</div>
      {SEARCH_LINKS.map((link) => (
        <Link key={link.trackingName} to={link.path} search={link.search}>
          {link.label}
        </Link>
      ))}
    </div>
  );
};

export default SearchLinks;
