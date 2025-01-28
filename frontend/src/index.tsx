import '@digitalspace/bcparks-bootstrap-theme/dist/css/bootstrap-theme.min.css';
import '@bcgov/bc-sans/css/BC_Sans.css';
import '@/styles/global.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';

const element = document.getElementById('root');
if (!element) throw new Error('Root element not found');

const root = createRoot(element);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

export default root;
