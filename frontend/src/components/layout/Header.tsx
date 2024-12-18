import BCLogo from '@/images/BC_nav_logo.svg';
import RSTLogo from '@/images/RST_nav_logo.svg';
import '@/styles/Header.scss';

const Header = () => {
  return (
    <header id="header">
      <nav id="header-nav">
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
    </header>
  );
};

export default Header;
