import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@shared/styles/bc-sans.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.scss';
import App from '@/App';
import {
  MAP_PROJECTION_BC_ALBERS,
  BC_ALBERS_PROJ4_DEF,
} from '@shared/components/recreation-resource-map';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

const element = document.getElementById('root');
if (!element) throw new Error('Root element not found');

const root = createRoot(element);

// Configure BC Albers projection for the map (needed for feature re-projection)
proj4.defs(MAP_PROJECTION_BC_ALBERS, BC_ALBERS_PROJ4_DEF);
register(proj4);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

export default root;
