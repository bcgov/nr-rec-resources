import { forwardRef } from 'react';
import parse from 'html-react-parser';
import alertIcon from '@/images/icons/red-alert.svg';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';

interface ClosuresProps {
  comment: string;
  siteName: string;
}

const Closures = forwardRef<HTMLElement, ClosuresProps>(
  ({ comment, siteName }, ref) => {
    if (!comment || !siteName) return null;
    return (
      <section id={SectionIds.CLOSURES} ref={ref}>
        <h2 className="section-heading">{SectionTitles.CLOSURES}</h2>
        <div className="advisory-container">
          <span className="icon-container fw-bold">
            <img alt={`Closure icon`} src={alertIcon} height={24} width={24} />
            <span className="capitalize">{siteName}</span>
            &nbsp;is closed
          </span>
          <p>{parse(comment)}</p>
        </div>
      </section>
    );
  },
);

export default Closures;
