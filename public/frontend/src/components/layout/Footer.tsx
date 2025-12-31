import RSTLogo from '@/images/RST_logo.svg';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EXTERNAL_LINKS } from '@/constants/urls';
import '@/components/layout/Footer.scss';
import FooterLinkColumn from './FooterLinkColumn';
import FooterLink from './FooterLink';
import { Link } from '@tanstack/react-router';
import { ROUTE_PATHS } from '@/constants/routes';

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
        url: EXTERNAL_LINKS.RULES_ETIQUETTE,
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
        title: 'Research opportunities',
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
        component: (
          <Link to={ROUTE_PATHS.CONTACT_US} hash="contact-us">
            Contact us
          </Link>
        ),
      },
      {
        title: 'Facebook BC Recreation Sites and Trails',
        url: EXTERNAL_LINKS.FACEBOOK_BC_REC,
        component: (
          <a
            href={EXTERNAL_LINKS.FACEBOOK_BC_REC}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Facebook BC Recreation Sites and Trails"
          >
            <FontAwesomeIcon
              className="icon"
              icon={faFacebook}
              aria-hidden={true}
            />
          </a>
        ),
      },
    ],
  },
];

const footerLinks = [
  {
    title: 'Accessibility',
    url: 'https://www2.gov.bc.ca/gov/content?id=E08E79740F9C41B9B0C484685CC5E412',
  },
  {
    title: 'Disclaimer',
    url: 'https://www2.gov.bc.ca/gov/content?id=79F93E018712422FBC8E674A67A70535',
  },
  {
    title: 'Privacy',
    url: 'https://www2.gov.bc.ca/gov/content?id=9E890E16955E4FF4BF3B0E07B4722932',
  },
  {
    title: 'Copyright',
    url: 'https://www2.gov.bc.ca/gov/content?id=1AAACC9C65754E4D89A118B875E0FBDA',
  },
];

const Footer = () => {
  return (
    <footer id="footer">
      <div
        className="land-acknowledgement-box text-white shadow d-flex align-items-center"
        aria-label="Land Acknowledgement"
      >
        <p className="mb-0 small">
          We acknowledge all First Nations on whose territories Recreation Sites
          and Trails were established. We honour their connection to the land
          and respect the importance of their diverse teachings, traditions, and
          practices within these territories.
        </p>
      </div>
      <div className="home-footer" id="home-footer">
        <div className="row no-gutters pb-2">
          <div className="col col-12 col-md-4 logo-column">
            <div className="mb-5">
              <a className="d-inline-block" href="/">
                <img
                  src={RSTLogo}
                  alt="Recreation Sites and Trails BC Logo"
                  style={{ height: 96 }}
                />
              </a>
            </div>
          </div>
          <div className="col col-12 col-md-6 links-container">
            <div className="row no-gutters">
              {linkColumns.map((item, index) => (
                <FooterLinkColumn
                  key={index}
                  title={item.title}
                  links={item.links}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-center pt-4 mt-4 border-top border-white">
          {footerLinks.map((item, index) => (
            <FooterLink key={index} title={item.title} url={item.url} />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
