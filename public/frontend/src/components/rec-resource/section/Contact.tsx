import { forwardRef } from 'react';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';
import { ResponseError, SiteOperatorDto } from '@/service/recreation-resource';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { getContactEmailLink } from '@/utils/getContactEmailLink';

interface SiteOperatorProps {
  siteOperator?: SiteOperatorDto;
  error: ResponseError | null;
  isLoading: boolean;
  refetchData: any;
  rec_resource?: RecreationResourceDetailModel;
}

const Contact = forwardRef<HTMLElement, SiteOperatorProps>(
  ({ siteOperator, error, isLoading, refetchData, rec_resource }, ref) => {
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
                    <a href={getContactEmailLink(rec_resource)}>Contact Us</a>
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
