import { FC } from 'react';
import { trackEvent } from '@/utils/matomo';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { RecreationResourceDocDto } from '@/service/recreation-resource';

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
            category: 'Recreation Resource page document download',
            action: 'Click',
            name: `Download ${recResource.name} -  ${doc.title} [${doc.extension.toUpperCase()}]`,
          })
        }
      >
        {docs.length === 1 ? `Map of ${recResource.name}` : doc.title} [
        {doc.extension.toUpperCase()}]
      </a>
    </li>
  );

  return <ul>{docs.map(renderDocDetails)}</ul>;
};
