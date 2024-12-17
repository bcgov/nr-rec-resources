import BCLogo from '@/images/BC_nav_logo.svg';
import RSTLogo from '@/images/RST_nav_logo.svg';

const Header = () => {
  return (
    <header>
      <nav
        className="navbar navbar-expand-lg navbar-dark"
        aria-label="Header navigation"
      >
        <div className="container">
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
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              <a className="nav-item nav-link" href="/bootstrap-theme/">
                Home
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
