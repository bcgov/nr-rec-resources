import '@/index.css';
import '@digitalspace/bcparks-bootstrap-theme/dist/css/bootstrap-theme.min.css';
import '@bcgov/bc-sans/css/BC_Sans.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

export default root;
