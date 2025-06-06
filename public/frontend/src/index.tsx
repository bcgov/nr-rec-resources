import '@digitalspace/bcparks-bootstrap-theme/dist/css/bootstrap-theme.min.css';
import '@bcgov/bc-sans/css/BC_Sans.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@/styles/global.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { MAP_PROJECTION_BC_ALBERS } from '@/components/rec-resource/RecreationResourceMap/constants';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

const element = document.getElementById('root');
if (!element) throw new Error('Root element not found');

// Configure BC Albers projection for the map
proj4.defs(
  MAP_PROJECTION_BC_ALBERS,
  '+proj=aea +lat_0=45 +lon_0=-126 +lat_1=50 +lat_2=58.5 +x_0=1000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
);
register(proj4);

const root = createRoot(element);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

export default root;
