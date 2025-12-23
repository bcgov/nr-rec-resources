import { FC } from 'react';
import { trackEvent } from '@shared/utils';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { RecreationResourceDocDto } from '@/service/recreation-resource';
import { MATOMO_CATEGORY_PDF_VIEWED } from '@/constants/analytics';

/**
 * Props interface for the RecreationResourceDocsList component
 * @property {RecreationResourceDetailModel} recResource - The recreation resource detail model containing document information
 */
interface RecreationResourceDocsListProps {
  recResource: RecreationResourceDetailModel;
}

/**
 * Renders a list of recreation resource documents as clickable links
 */
export const RecreationResourceDocsList: FC<
  RecreationResourceDocsListProps
> = ({ recResource }) => {
  const docs = recResource.recreation_resource_docs;

  if (!docs?.length) {
    return null;
  }

  const renderDocDetails = (doc: RecreationResourceDocDto) => (
    <li key={doc.ref_id}>
      <a
        className="text-decoration-underline link-color"
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackEvent({
            category: MATOMO_CATEGORY_PDF_VIEWED,
            action: `PDF_viewed_${recResource.rec_resource_id}`,
            name: `PDF_viewed_${recResource.rec_resource_id}_${doc.title}`,
          })
        }
      >
        {doc.title} [{doc.extension.toUpperCase()}]
      </a>
    </li>
  );

  return <ul>{docs.map(renderDocDetails)}</ul>;
};
