import { trackClickEvent } from '@shared/utils';
import { MATOMO_CATEGORY_FOOTER_LINK } from '@/constants/analytics';

interface FooterLinkProps {
  title: string;
  url: string;
}

const FooterLink = ({ title, url }: FooterLinkProps) => {
  return (
    <div className="footer-utility-link d-inline-block">
      <a
        className="nav-link"
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={trackClickEvent({
          category: MATOMO_CATEGORY_FOOTER_LINK,
          action: 'Click',
          name: `Footer link - ${title}`,
        })}
      >
        {title}
      </a>
    </div>
  );
};

export default FooterLink;
