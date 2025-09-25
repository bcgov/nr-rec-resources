import { forwardRef } from 'react';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';
import { ResponseError, SiteOperatorDto } from '@/service/recreation-resource';
import { Link } from 'react-router';
import { trackClickEvent } from '@/utils/matomo';
import { MATOMO_TRACKING_CATEGORY_CONTACT_PAGE } from '@/data/analytics';
import { ROUTE_PATHS } from '@/routes';

interface SiteOperatorProps {
  siteOperator?: SiteOperatorDto;
  error: ResponseError | null;
  isLoading: boolean;
  refetchData: any;
  rec_resource_id: string;
}

const Contact = forwardRef<HTMLElement, SiteOperatorProps>(
  ({ siteOperator, error, isLoading, refetchData, rec_resource_id }, ref) => {
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
                  General questions and feedback for Recreation Sites and Trails
                  BC
                </th>
                <td>
                  <p>
                    We answer emails weekdays from 8:30 am to 4:30 pm Pacific
                    Time.
                  </p>
                  <p>
                    <Link
                      to={{
                        pathname: ROUTE_PATHS.REC_RESOURCE_CONTACT.replace(
                          ':id',
                          rec_resource_id,
                        ),
                        hash: '#contact-us',
                      }}
                      onClick={trackClickEvent({
                        category: MATOMO_TRACKING_CATEGORY_CONTACT_PAGE,
                        name: `${MATOMO_TRACKING_CATEGORY_CONTACT_PAGE} - ${rec_resource_id}`,
                      })}
                    >
                      Contact us
                    </Link>
                  </p>
                </td>
              </tr>
              {!error && (
                <tr>
                  <th>Site operator</th>
                  <td>
                    <p data-testid="operator-result">
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
                      <p
                        data-testid="error-message"
                        className="not-found-message"
                      >
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
