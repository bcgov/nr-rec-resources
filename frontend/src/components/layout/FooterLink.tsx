interface FooterLinkProps {
  title: string;
  url: string;
}

const FooterLink = (props: FooterLinkProps) => {
  return (
    <div className="footer-utility-link d-inline-block">
      <a className="nav-link" href={props.url} target="_blank" rel="noreferrer">
        {props.title}
      </a>
    </div>
  );
};

export default FooterLink;
