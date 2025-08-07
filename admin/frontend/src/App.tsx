import { AuthGuard, Header, NotificationBar, PageLayout } from "@/components";
import { AuthProvider } from "@/contexts/AuthContext";
import { LandingPage } from "@/pages/LandingPage";
import { RecResourcePage } from "@/pages/rec-resource-page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "./routes";
import { useGlobalQueryErrorHandler } from "./services/hooks/useGlobalQueryErrorHandler";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useGlobalQueryErrorHandler(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          <Header />
          <NotificationBar />
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.LANDING} element={<LandingPage />} />
              <Route
                path={ROUTES.REC_RESOURCE_PAGE}
                element={
                  <PageLayout>
                    <RecResourcePage />
                  </PageLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthGuard>
      </AuthProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
