import { Spinner } from 'react-bootstrap';
import RecResourceCard from '@/components/rec-resource/card/RecResourceCard';
import { useGetRecreationResourceById } from '@/service/queries/recreation-resource';
import { IMAGE_SIZE_CODE_FOR_SEARCH_RESULTS_CARD } from '@/components/rec-resource/card/constants';

interface RecreationFeaturePreviewProps {
  rec_resource_id: string;
}

const RecreationFeaturePreview: React.FC<RecreationFeaturePreviewProps> = ({
  rec_resource_id,
}) => {
  const { data: recreationResource } = useGetRecreationResourceById({
    id: rec_resource_id,
    imageSizeCodes: [IMAGE_SIZE_CODE_FOR_SEARCH_RESULTS_CARD],
  });

  return (
    <>
      {!recreationResource ? (
        <Spinner animation="border" role="status" className="mb-2" />
      ) : (
        <RecResourceCard recreationResource={recreationResource} />
      )}
    </>
  );
};

export default RecreationFeaturePreview;
