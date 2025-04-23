import { forwardRef } from 'react';
import { EXTERNAL_LINKS } from '@/data/urls';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';
import { ResponseError, SiteOperatorDto } from '@/service/recreation-resource';

interface SiteOperatorProps {
  siteOperator?: SiteOperatorDto;
  error: ResponseError | null;
  isLoading: boolean;
  refetchData: any;
}

const Contact = forwardRef<HTMLElement, SiteOperatorProps>(
  ({ siteOperator, error, isLoading, refetchData }, ref) => {
    const formattedName = siteOperator?.clientName
      ?.toLowerCase()
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

    const callRefetch = () => {
      refetchData();
    };

    return (
      <section id={SectionIds.CONTACT} ref={ref}>
        <h2 className="section-heading">{SectionTitles.CONTACT}</h2>
        <figure className="table">
          <table>
            <tbody>
              <tr>
                <th>
                  General questions and feedback for Recreation Sites & Trails
                  BC
                </th>
                <td>
                  <p>
                    We answer emails weekdays from 9 am to 5 pm Pacific Time.
                  </p>
                  <p>
                    <a href={EXTERNAL_LINKS.CONTACT}>Contact Us</a>
                  </p>
                </td>
              </tr>
              {!error && (
                <tr>
                  <th>Site operator</th>
                  <td>
                    <p>
                      {isLoading ? (
                        <span className="not-found-message">Loading ...</span>
                      ) : (
                        <span>{formattedName}</span>
                      )}
                    </p>
                  </td>
                </tr>
              )}
              {error?.response &&
                error?.response.status >= 500 &&
                error?.response.status < 600 && (
                  <tr>
                    <th>Site operator</th>
                    <td>
                      <p className="not-found-message">
                        Error retrieving site operator.{' '}
                        <a href="" onClick={() => callRefetch()}>
                          Click here to retry.
                        </a>
                      </p>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </figure>
      </section>
    );
  },
);

export default Contact;
