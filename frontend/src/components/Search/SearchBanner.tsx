import '@/styles/components/Search.scss';

const SearchBanner = () => {
  return (
    <div className="page-nav-container search">
      <nav aria-label="Search banner" className="page-nav search-banner">
        <h1>Find a recreation site or trail</h1>
        <input type="text" placeholder="Search..."></input>
      </nav>
    </div>
  );
};

export default SearchBanner;
