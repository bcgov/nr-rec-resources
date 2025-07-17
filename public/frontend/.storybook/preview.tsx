import type { Preview } from '@storybook/react-vite';
import {
  initialize as initializeMSWAddon,
  mswLoader,
} from 'msw-storybook-addon';

// importing global styles
import '@digitalspace/bcparks-bootstrap-theme/dist/css/bootstrap-theme.min.css';
import '@bcgov/bc-sans/css/BC_Sans.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@/styles/global.scss';

initializeMSWAddon();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
};

export default preview;
