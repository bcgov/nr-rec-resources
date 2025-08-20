import { ReactNode, memo, useCallback } from 'react';
import { trackClickEvent } from '@/utils/matomo';
import { Stack } from 'react-bootstrap';

interface LinkProps {
  title: string;
  url?: string;
  component?: ReactNode;
}

interface LinkColumnProps {
  title: string;
  links: LinkProps[];
}

const FooterLinkColumn = memo(({ title, links }: LinkColumnProps) => {
  const handleButtonClick = useCallback((linkTitle: string) => {
    trackClickEvent({
      category: 'Footer link',
      name: `Footer link - ${linkTitle}`,
    })();
  }, []);

  const handleButtonKeyDown = useCallback(
    (linkTitle: string, e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleButtonClick(linkTitle);
      }
    },
    [handleButtonClick],
  );

  return (
    <div className="col-md-4 links-column">
      <div>
        <p className="footer-heading">{title}</p>
        <hr />
        <Stack gap={3}>
          {links.map((link) =>
            !link.component ? (
              <span key={link.title} className="paragraph-links mb-0">
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
              </span>
            ) : (
              <div
                key={link.title}
                className="paragraph-links mb-0"
                onClick={() => handleButtonClick(link.title)}
                onKeyDown={(e) => handleButtonKeyDown(link.title, e)}
                tabIndex={0}
              >
                {link.component}
              </div>
            ),
          )}
        </Stack>
      </div>
    </div>
  );
});

export default FooterLinkColumn;
