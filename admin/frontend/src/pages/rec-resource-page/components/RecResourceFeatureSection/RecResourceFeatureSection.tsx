import { RecreationFeatureDto } from '@/services/recreation-resource-admin/models';
import { Stack } from 'react-bootstrap';

type RecResourceFeatureSectionProps = {
  recreationFeatures: RecreationFeatureDto[];
};

export const RecResourceFeatureSection = ({
  recreationFeatures,
}: RecResourceFeatureSectionProps) => {
  const sortedFeatures = [...(recreationFeatures ?? [])].sort((a, b) =>
    a.recreation_feature_code.localeCompare(b.recreation_feature_code),
  );

  return (
    <Stack direction="vertical" gap={4}>
      <h2>Significant resource features</h2>

      {sortedFeatures.length === 0 ? (
        <div>No significant resource features assigned.</div>
      ) : (
        <div>
          <ul className="list-unstyled">
            {sortedFeatures.map((feature) => (
              <li className="fw-bold" key={feature.recreation_feature_code}>
                {feature.recreation_feature_code} - {feature.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Stack>
  );
};
