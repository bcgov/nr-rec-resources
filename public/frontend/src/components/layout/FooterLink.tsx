import { trackClickEvent } from '@/utils/matomo';

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
          category: 'Footer link',
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
