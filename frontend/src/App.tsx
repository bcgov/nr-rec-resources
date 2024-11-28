import AppRoutes from '@/routes';
import { BrowserRouter } from 'react-router-dom';
import { Footer, Header } from '@bcgov/design-system-react-components';

export default function App() {
  return (
    <>
      <Header title={'Recreation Sites and Trails BC'} />
      <main>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </main>
      <Footer />
    </>
  );
}
