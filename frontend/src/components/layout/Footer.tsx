import RSTLogo from '@/images/RST_nav_logo.svg';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EXTERNAL_LINKS } from '@/data/urls';
import '@/components/layout/Footer.scss';
import FooterLinkColumn from './FooterLinkColumn';
import FooterLink from './FooterLink';

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
        url: EXTERNAL_LINKS.RULES_ETIQUETE,
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
        url: EXTERNAL_LINKS.CONTACT,
        component: null,
      },
      {
        title: 'Facebook BC Recreation Sites and Trails',
        url: EXTERNAL_LINKS.FACEBOOK_BC_REC,
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
      <div className="home-footer" id="home-footer">
        <div className="row no-gutters">
          <div className="col col-12 col-md-4 logo-column">
            <div className="mb-5">
              <a className="d-inline-block" href="/">
                <img
                  src={RSTLogo}
                  alt="Recreation Sites and Trails BC Logo"
                  style={{ height: 125 }}
                />
              </a>
              <span className="beta-button">BETA</span>
              <p className="paragraph-links back-original-link">
                <a href={EXTERNAL_LINKS.ORIGINAL_SITE}>Back to original site</a>
              </p>
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
        <div className="text-left pt-4 mt-3 border-top border-white">
          {footerLinks.map((item, index) => (
            <FooterLink key={index} title={item.title} url={item.url} />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
