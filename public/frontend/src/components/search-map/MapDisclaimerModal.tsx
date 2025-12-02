import { Button, Modal } from 'react-bootstrap';
import RSTLogo from '@/images/RST_nav_logo.svg';
import '@/components/search-map/MapDisclaimerModal.scss';
import Cookies from 'js-cookie';

interface MapDisclaimerModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const MapDisclaimerModal = ({ isOpen, setIsOpen }: MapDisclaimerModalProps) => {
  const handleCookie = (checked: boolean) => {
    if (checked) {
      Cookies.set('hidemap-disclaimer-dialog', 'true', { expires: 180 }); // expires in 6 months
    } else {
      Cookies.remove('hidemap-disclaimer-dialog');
    }
  };
  const handleCloseModal = () => {
    setIsOpen(false);
  };
  return (
    <Modal
      show={isOpen}
      onHide={handleCloseModal}
      aria-labelledby="map-disclaimer-modal"
      className="map-disclaimer-modal d-block"
      scrollable
    >
      <Modal.Body className="map-disclaimer-modal-content">
        <div className="map-disclaimer-modal-content--header">
          <nav aria-label="Main header navigation">
            <div className="navbar-brand">
              <img
                src={RSTLogo}
                alt="Recreation Sites and Trails BC Logo"
                style={{ height: 37 }}
              />
            </div>
          </nav>
        </div>
        <div className="content">
          <h4>Welcome to the Recreation Sites and Trails Map</h4>
          <p className="p-title">Disclaimer</p>
          <p>
            This map shows the locations and current closure notices for BC
            recreation sites and trails. While it aims to provide accurate
            information, conditions can change quickly, and the Government of
            British Columbia makes no representation or warranties regarding the
            accuracy of information from this map, nor will it accept
            responsibility for errors or omission. Content may be suspended,
            altered or discontinued at any time without prior notice.
          </p>
          <p className="p-title">Your safety is your responsibility</p>
          <p>
            Users assume all risks and must stay informed about current
            conditions, closures, and restrictions. Wilderness areas may involve
            hazards such as rough terrain, industrial traffic, minimal or no
            maintenance, and unpredictable weather. Be prepared, plan ahead, use
            multiple sources, follow posted signs, and check official updates
            at:{' '}
            <a
              href="https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/alerts"
              target="_blank"
              rel="noreferrer"
            >
              Alerts, closures and warnings.
            </a>
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer d-flex justify-content-between">
        <div>
          <input
            type="checkbox"
            id="dont-show-again"
            className="me-2"
            onChange={(e) => handleCookie(e.target.checked)}
          />
          <label htmlFor="dont-show-again">Don&apos;t show again</label>
        </div>
        <Button className="py-4" onClick={handleCloseModal}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MapDisclaimerModal;
