import RSTLogo from '@/images/RST_nav_logo.svg';
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
            {/* <div className="row no-gutters"> */}
            {/*   {footerMenu.map((item, index) => ( */}
            {/*     <FooterMenu item={item} key={index} /> */}
            {/*   ))} */}
            {/* </div> */}
          </div>
        </div>
        <div className="text-left text-sm-center pt-4 mt-5 border-top border-white">
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
          <div className="footer-utility-link d-inline-block">
            <a className="nav-link" href={EXTERNAL_LINKS.CONTACT}>
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
