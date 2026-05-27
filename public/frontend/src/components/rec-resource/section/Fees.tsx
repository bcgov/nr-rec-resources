import { forwardRef, Fragment, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { RecreationFeeModel } from '@/service/custom-models';
import RecreationFee from './RecreationFee';
import { SectionTitles } from '@/components/rec-resource/enum';
import './Fees.scss';

interface FeesProps {
  id: string;
  campsite_count?: number;
  overnight_fees?: RecreationFeeModel[];
  trail_use_fees?: RecreationFeeModel[];
  additional_fees?: RecreationFeeModel[];
}

type SectionKey = 'overnight' | 'trail' | 'additional';

interface FeeSectionConfig {
  key: SectionKey;
  /** Heading shown above the section (e.g. "Overnight fees"). */
  heading: string;
  /** Lowercase label used in the bulk button text/aria-label. */
  label: string;
  fees: RecreationFeeModel[];
  /** Only the overnight section currently needs this. */
  campsiteCount?: number;
}

const Fees = forwardRef<HTMLElement, FeesProps>(
  (
    {
      id,
      campsite_count = 0,
      overnight_fees = [],
      trail_use_fees = [],
      additional_fees = [],
    },
    ref,
  ) => {
    const [expandedSections, setExpandedSections] = useState<
      Record<SectionKey, boolean>
    >({
      overnight: false,
      trail: false,
      additional: false,
    });

    const toggleSection = (section: SectionKey) => {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    };

    const handleAllExpandedChange =
      (section: SectionKey) => (allExpanded: boolean) => {
        setExpandedSections((prev) =>
          prev[section] === allExpanded
            ? prev
            : { ...prev, [section]: allExpanded },
        );
      };

    // Single source of truth for the three fee sections. Each section's
    // key is declared here exactly once, eliminating the threefold
    // duplication of the previous markup.
    const sections: FeeSectionConfig[] = [
      {
        key: 'overnight',
        heading: 'Overnight fees',
        label: 'overnight fees',
        fees: overnight_fees,
        campsiteCount: campsite_count,
      },
      {
        key: 'trail',
        heading: 'Trail fees',
        label: 'trail fees',
        fees: trail_use_fees,
      },
      {
        key: 'additional',
        heading: 'Additional fees',
        label: 'additional fees',
        fees: additional_fees,
      },
    ];

    const visibleSections = sections.filter((s) => s.fees.length > 0);

    if (visibleSections.length === 0) {
      return null;
    }

    return (
      <section id={id} ref={ref}>
        <h2 className="section-heading">{SectionTitles.FEES}</h2>
        <p>
          {'See '}
          <a
            href="https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning/fees"
            target="_blank"
            rel="noopener noreferrer"
          >
            fees, discounts and reservations
          </a>
          {' for more information.'}
        </p>

        {visibleSections.map((section) => {
          const isExpanded = expandedSections[section.key];
          const showBulkToggle = section.fees.length > 1;
          const actionVerb = isExpanded ? 'Collapse' : 'Expand';

          return (
            <Fragment key={section.key}>
              <h3 className="fee-section-heading">{section.heading}</h3>
              <div className="fee-section-wrapper">
                {showBulkToggle && (
                  <div className="fee-section-collapse-header">
                    <button
                      className="fee-section-collapse-button"
                      onClick={() => toggleSection(section.key)}
                      aria-label={`${actionVerb} ${section.label}`}
                    >
                      {actionVerb} all {section.label}
                      <FontAwesomeIcon
                        icon={faChevronUp}
                        className={`collapse-icon ${isExpanded ? 'expanded' : 'collapsed'}`}
                      />
                    </button>
                  </div>
                )}
                <RecreationFee
                  data={section.fees}
                  campsite_count={section.campsiteCount}
                  expandAll={isExpanded}
                  onAllExpandedChange={handleAllExpandedChange(section.key)}
                />
              </div>
            </Fragment>
          );
        })}
      </section>
    );
  },
);

export default Fees;
