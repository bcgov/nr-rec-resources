interface SiteDescriptionProps {
  description: string;
}

const SiteDescription = ({ description }: SiteDescriptionProps) => {
  return (
    <section>
      <h2 className="section-heading">Site Description</h2>
      <p>{description}</p>
    </section>
  );
};

export default SiteDescription;
