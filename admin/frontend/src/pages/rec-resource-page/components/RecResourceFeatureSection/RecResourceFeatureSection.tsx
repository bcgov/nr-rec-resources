import { RecreationFeatureDto } from '@/services/recreation-resource-admin/models';
import { HelpIcon } from '@/components';
import { FEATURES_HELP_TEXT } from '@/utils/helpText';
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
      <div className="d-flex align-items-center gap-2">
        <h2 className="mb-0">Significant resource features</h2>
        <HelpIcon id="features-help" text={FEATURES_HELP_TEXT} />
      </div>

      {sortedFeatures.length === 0 ? (
        <div>No significant resource features assigned.</div>
      ) : (
        <div>
          <ul className="list-unstyled">
            {sortedFeatures.map((feature, index) => (
              <li
                className="fw-bold"
                key={`${feature.recreation_feature_code}-${index}`}
              >
                {feature.recreation_feature_code} - {feature.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Stack>
  );
};
