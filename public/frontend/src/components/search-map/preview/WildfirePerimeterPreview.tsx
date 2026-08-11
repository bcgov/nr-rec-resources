/**
 * @deprecated Use WildfirePreview with type="perimeter" instead.
 */
import type Feature from 'ol/Feature';
import WildfirePreview from './WildfirePreview';

interface WildfirePerimeterPreviewProps {
  onClose?: () => void;
  perimeterFeature: Feature;
}

const WildfirePerimeterPreview: React.FC<WildfirePerimeterPreviewProps> = ({
  onClose,
  perimeterFeature,
}) => (
  <WildfirePreview
    onClose={onClose}
    feature={perimeterFeature}
    type="perimeter"
  />
);

export default WildfirePerimeterPreview;
