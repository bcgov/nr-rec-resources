import { ReactNode } from 'react';
import { trackClickEvent } from '@/utils/matomo';
import { Stack } from 'react-bootstrap';

interface LinkProps {
  title: string;
  url?: string;
  component: ReactNode;
}

interface LinkColumnProps {
  title: string;
  links: LinkProps[];
}

const FooterLinkColumn = ({ title, links }: LinkColumnProps) => {
  return (
    <div className="col-md-4 links-column">
      <div>
        <p className="footer-heading">{title}</p>
        <hr />
        <Stack gap={3}>
          {links.map((link, linkIndex) =>
            !link.component ? (
              <p key={linkIndex} className="paragraph-links mb-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={trackClickEvent({
                    category: 'Footer link',
                    name: `Footer link - ${link.title}`,
                  })}
                >
                  {link.title}
                </a>
              </p>
            ) : (
              <p key={linkIndex} className="paragraph-links mb-0">
                <a
                  key={linkIndex}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  title={link.title}
                  onClick={trackClickEvent({
                    category: 'Footer link',
                    name: `Footer link - ${link.title}`,
                  })}
                >
                  {link.component}
                </a>
              </p>
            ),
          )}
        </Stack>
      </div>
    </div>
  );
};

export default FooterLinkColumn;
