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
              className="img-fluid d-none d-md-block"
              src="/bcid-logo-rev-en.svg"
              width="181"
              height="44"
              alt="B.C. Government Logo"
            />
            <img
              className="img-fluid d-md-none"
              src="/bcid-symbol-rev.svg"
              width="64"
              height="44"
              alt="B.C. Government Logo"
            />
          </a>
          <div className="navbar-brand">Recreation Sites and Trails BC</div>
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
