import type { Preview } from '@storybook/react-vite';
import {
  initialize as initializeMSWAddon,
  mswLoader,
} from 'msw-storybook-addon';

// importing global styles
import '@/styles/global.scss';
import '@bcgov/bc-sans/css/BC_Sans.css';
import '@digitalspace/bcparks-bootstrap-theme/dist/css/bootstrap-theme.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

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
