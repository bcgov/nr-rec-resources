import BCLogo from '@/images/BC_nav_logo.svg';
import RSTLogo from '@/images/RST_nav_logo.svg';
import '@/styles/components/Header.scss';

const Header = () => {
  return (
    <header id="header">
      <div className="page-nav-container main">
        <nav
          aria-label="Main header navigation"
          className="page-nav header-nav main"
        >
          <a className="navbar-brand" href="https://www2.gov.bc.ca">
            <img
              src={BCLogo}
              alt="British Columbia Logo"
              style={{ height: 64 }}
            />
            <img
              src={RSTLogo}
              alt="Recreation Sites and Trails BC Logo"
              style={{ height: 64 }}
            />
          </a>
        </nav>
      </div>
      <div className="page-nav-container sub">
        <nav
          aria-label="Secondary header site navigation"
          className="header-nav sub"
        >
          <a href="/search">Find a recreation site or trail</a>
          <a href="/">Contact</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
