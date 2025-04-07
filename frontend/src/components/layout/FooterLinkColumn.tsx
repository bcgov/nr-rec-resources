import { ReactNode } from 'react';

interface LinkProps {
  title: string;
  url: string;
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
        {links.map((link, linkIndex) =>
          !link.component ? (
            <p key={linkIndex} className="paragraph-links">
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.title}
              </a>
            </p>
          ) : (
            <a
              key={linkIndex}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              title={link.title}
            >
              {link.component}
            </a>
          ),
        )}
      </div>
    </div>
  );
};

export default FooterLinkColumn;
