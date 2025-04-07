interface FooterLinkProps {
  title: string;
  url: string;
}

const FooterLink = ({ title, url }: FooterLinkProps) => {
  return (
    <div className="footer-utility-link d-inline-block">
      <a className="nav-link" href={url} target="_blank" rel="noreferrer">
        {title}
      </a>
    </div>
  );
};

export default FooterLink;
