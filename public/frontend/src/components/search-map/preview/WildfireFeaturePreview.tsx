/**
 * @deprecated Use WildfirePreview with type="location" instead.
 */
import type Feature from 'ol/Feature';
import WildfirePreview from './WildfirePreview';

interface WildfireFeaturePreviewProps {
  onClose?: () => void;
  wildfireFeature: Feature;
}

const WildfireFeaturePreview: React.FC<WildfireFeaturePreviewProps> = ({
  onClose,
  wildfireFeature,
}) => (
  <WildfirePreview
    onClose={onClose}
    feature={wildfireFeature}
    type="location"
  />
);

export default WildfireFeaturePreview;
