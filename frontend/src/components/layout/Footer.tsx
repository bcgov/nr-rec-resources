import RSTLogo from '@/images/RST_nav_logo.svg';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EXTERNAL_LINKS } from '@/data/urls';
import '@/components/layout/Footer.scss';

const Footer = () => {
  const linkColumns = [
    {
      title: 'Plan your visit',
      links: [
        {
          title: 'Closures',
          url: EXTERNAL_LINKS.CLOSURE,
          component: null,
        },
        {
          title: 'Rules and etiquette',
          url: EXTERNAL_LINKS.CLOSURE,
          component: null,
        },
        {
          title: 'Authorizations',
          url: EXTERNAL_LINKS.AUTHORIZATIONS,
          component: null,
        },
      ],
    },
    {
      title: 'Get involved',
      links: [
        {
          title: 'Partnering and volunteering',
          url: EXTERNAL_LINKS.PARTNERING,
          component: null,
        },
        {
          title: 'Research oportunities',
          url: EXTERNAL_LINKS.RESEARCH_OPT,
          component: null,
        },
        {
          title: 'ORV Trail Fund',
          url: EXTERNAL_LINKS.ORV_TRAIL,
          component: null,
        },
      ],
    },
    {
      title: 'Stay connected',
      links: [
        {
          title: 'Contact us',
          url: EXTERNAL_LINKS.CONTACT,
          component: null,
        },
        {
          title: null,
          url: EXTERNAL_LINKS.RESEARCH_OPT,
          component: (
            <FontAwesomeIcon
              className="icon"
              icon={faFacebook}
              aria-hidden={true}
            />
          ),
        },
      ],
    },
  ];
  return (
    <footer id="footer">
      <div className="home-footer" id="home-footer">
        <div className="row no-gutters">
          <div className="col col-12 col-md-4 logo-column">
            <div className="mb-5">
              <a className="d-inline-block" href="/">
                <img
                  src={RSTLogo}
                  alt="Recreation Sites and Trails BC Logo"
                  style={{ height: 104 }}
                />
              </a>
              <span className="beta-button">BETA</span>
              <p className="paragraph-links back-original-link">
                <a href={EXTERNAL_LINKS.ORIGINAL_SITE}>Back to original site</a>
              </p>
            </div>
          </div>
          <div className="col col-12 col-md-6">
            <div className="row no-gutters">
              {linkColumns.map((item, index) => (
                <div key={index} className="col-md-4 links-column">
                  <div>
                    <p className="footer-heading">{item.title}</p>
                    <hr />
                    {item.links.map((link, linkIndex) =>
                      !link.component ? (
                        <p key={linkIndex} className="paragraph-links">
                          <a href={link.url} target="_blank" rel="noreferrer">
                            {link.title}
                          </a>
                        </p>
                      ) : (
                        <a
                          key={linkIndex}
                          href={EXTERNAL_LINKS.FACEBOOK_BC_REC}
                          target="_blank"
                          rel="noreferrer"
                          title="Facebook BC Recreation Sites and Trails"
                        >
                          {link.component}
                        </a>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-left pt-4 mt-3 border-top border-white">
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
