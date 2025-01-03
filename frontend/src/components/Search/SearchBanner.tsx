import '@/styles/components/Search.scss';

const SearchBanner = () => {
  return (
    <div className="page-nav-container search">
      <nav aria-label="Search banner" className="page-nav">
        <input type="text" placeholder="Search..."></input>
      </nav>
    </div>
  );
};

export default SearchBanner;
