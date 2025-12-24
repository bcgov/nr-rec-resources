import { Link } from '@tanstack/react-router';
import {
  SEARCH_LINKS,
  SEARCH_LINKS_TITLE,
} from '@/components/search/constants';
import '@/components/search/SearchLinks.scss';

interface SearchLinksProps {
  downloadKMLModalFunction: () => void;
}

const SearchLinks = ({ downloadKMLModalFunction }: SearchLinksProps) => {
  return (
    <div className="search-links-desktop">
      <div className="fs-6 fw-bold mb-1">{SEARCH_LINKS_TITLE}</div>
      {SEARCH_LINKS.map((link) => (
        <Link key={link.trackingName} to={link.path} search={link.search}>
          {link.label}
        </Link>
      ))}
      <a
        className="search-link-item"
        href="#"
        onClick={(event) => {
          event.preventDefault();
          downloadKMLModalFunction();
        }}
      >
        Download KML
      </a>
    </div>
  );
};

export default SearchLinks;
