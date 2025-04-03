import RSTLogo from '@/images/RST_nav_logo.svg';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EXTERNAL_LINKS } from '@/data/urls';
import '@/components/layout/Footer.scss';

const Footer = () => {
  return (
    <footer id="footer">
      <div className="home-footer" id="home-footer">
        <div className="row no-gutters">
          <div className="col col-12 col-md-4">
            <div className="mb-5">
              <a className="d-inline-block" href="/">
                <img
                  src={RSTLogo}
                  alt="Recreation Sites and Trails BC Logo"
                  style={{ height: 64 }}
                />
              </a>
            </div>
          </div>
          <div className="col col-12 col-md-8">
            <div className="row no-gutters">
              <div className="col-md-4">
                <div>
                  <p className="footer-heading">Plan your visit</p>
                  <hr />
                  <p>
                    <a
                      href={EXTERNAL_LINKS.CLOSURE}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Closures
                    </a>
                  </p>
                  <p>
                    <a
                      href={EXTERNAL_LINKS.RULES_ETIQUETE}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Rules and etiquette
                    </a>
                  </p>
                  <p>
                    <a
                      href={EXTERNAL_LINKS.RULES_ETIQUETE}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Authorizations
                    </a>
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <p className="footer-heading">Get involved</p>
                <hr />
                <p>
                  <a
                    href={EXTERNAL_LINKS.PARTNERING}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Partnering and volunteering
                  </a>
                </p>
                <p>
                  <a
                    href={EXTERNAL_LINKS.RESEARCH_OPT}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Research oportunities
                  </a>
                </p>
                <p>
                  <a
                    href={EXTERNAL_LINKS.ORV_TRAIL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ORV Trail Fund
                  </a>
                </p>
              </div>
              <div className="col-md-4">
                <p className="footer-heading">Stay connected</p>
                <hr />
                <p>
                  <a
                    href={EXTERNAL_LINKS.CONTACT}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Contact us
                  </a>
                </p>
                <p>
                  <a
                    href={EXTERNAL_LINKS.FACEBOOK_BC_REC}
                    target="_blank"
                    rel="noreferrer"
                    title="Facebook BC Recreation Sites and Trails"
                  >
                    <FontAwesomeIcon
                      className="icon"
                      icon={faFacebook}
                      aria-hidden={true}
                    />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-left pt-4 mt-5 border-top border-white">
          <div className="footer-utility-link d-inline-block">
            <a
              className="nav-link"
              href="https://www2.gov.bc.ca/gov/content?id=79F93E018712422FBC8E674A67A70535"
              target="_blank"
              rel="noreferrer"
            >
              Disclaimer
            </a>
          </div>
          <div className="footer-utility-link d-inline-block">
            <a
              className="nav-link"
              href="https://www2.gov.bc.ca/gov/content?id=9E890E16955E4FF4BF3B0E07B4722932"
              target="_blank"
              rel="noreferrer"
            >
              Privacy
            </a>
          </div>
          <div className="footer-utility-link d-inline-block">
            <a
              className="nav-link"
              href="https://www2.gov.bc.ca/gov/content?id=E08E79740F9C41B9B0C484685CC5E412"
              target="_blank"
              rel="noreferrer"
            >
              Accessibility
            </a>
          </div>
          <div className="footer-utility-link d-inline-block">
            <a
              className="nav-link"
              href="https://www2.gov.bc.ca/gov/content?id=1AAACC9C65754E4D89A118B875E0FBDA"
              target="_blank"
              rel="noreferrer"
            >
              Copyright
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
